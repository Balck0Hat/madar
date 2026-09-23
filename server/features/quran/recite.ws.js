import { WebSocketServer } from "ws";
import cookie from "cookie";
import { verifyAccess } from "../../shared/utils/tokens.js";
import { ACCESS_COOKIE } from "../../shared/utils/cookies.js";
import { mergeStatus, mergeSequential, relevant } from "./recite.merge.js";
import { words } from "../../shared/utils/arabic.js";
import { ayah as findAyah, suraAyahs } from "../../shared/data/quran/index.js";
import { env } from "../../shared/config/env.js";

// التسميع المباشر: المتصفح يرسل صوتاً خاماً (PCM 16 بت، 16 كيلوهرتز) قطعةً كل
// نصف ثانية؛ نحتفظ بآخر ست ثوانٍ ونرسلها كلما وصل صوت جديد لخدمة التعرّف المحلية،
// ونحاذي النصّ مع كلمات الآية المطلوبة ونعيد حالة كل كلمة. لا يُحفظ الصوت.
const RATE = 16000;
const WINDOW = 6 * RATE * 2; // بايتات: ست ثوانٍ، تكفي سياقاً وتُعرَف في نحو ثانية
const EVERY = 900;
const ASR = env.asrUrl || "http://127.0.0.1:3106";
const QUIET = 0.012; // جذر متوسط مربع العيّنات (0..1) الذي دونه القطعة صمت أو أنفاس
const MIN_NEW = 0.3 * RATE * 2; // بايتات صوت جديد مسموع قبل أن نطلب تعرّفاً آخر

// هل في القطعة صوت؟ نحسب الطاقة هنا كي لا نطلب تعرّفاً على صمت أصلاً
function loud(buf) {
  const n = buf.length >> 1;
  if (!n) return false;
  let sum = 0;
  for (let i = 0; i < n; i++) { const v = buf.readInt16LE(i * 2) / 32768; sum += v * v; }
  return Math.sqrt(sum / n) > QUIET;
}

const userOf = (req) => {
  try { return verifyAccess(cookie.parse(req.headers.cookie || "")[ACCESS_COOKIE] || "").sub; } catch { return null; }
};

async function transcribe(buf) {
  const res = await fetch(`${ASR}/transcribe`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: buf });
  if (!res.ok) throw new Error(`asr ${res.status}`);
  return (await res.json()).text || "";
}

function session(ws) {
  let expected = []; // كلمات الآية المطبَّعة
  let status = []; // حالة كل كلمة، لا ترجع الخضراء حمراء أبداً
  let chunks = [];
  let size = 0;
  let busy = false;
  let fresh = 0; // بايتات الصوت المسموع الجديد منذ آخر تعرّف
  let bounds = []; // حدود الآيات؛ أكثر من آية تعني تسميعاً متسلسلاً
  let finished = false; // «done» تُرسل مرة واحدة
  let stopRequested = false; // طلب إيقاف وصل والتعرّف مشغول: يُنفَّذ بعده
  const send = (o) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(o));
  // الدمج في recite.merge.js: مطابقة من موضع القارئ، والأخضر لا يرجع، والخطأ لا يُعلن إلا بعد تجاوزه
  const merge = (text) => { const r = bounds.length > 1 ? mergeSequential(status, expected, text, bounds) : mergeStatus(status, expected, text); status = r.status; return r; };

  const run = async (force = false) => {
    if (busy || !size || !expected.length || (fresh < MIN_NEW && !force)) return;
    busy = true; fresh = 0;
    try {
      const text = await transcribe(Buffer.concat(chunks));
      // كلام لا يخصّ الآية القريبة (ضجيج، أنفاس، آية أخرى) لا يُعرض ولا يُحتسب
      if ((text && relevant(status, expected, text)) || force) {
        const r = merge(text);
        send({ t: "state", text: relevant(status, expected, text) ? text : "", ...r });
        if (r.done && !finished) { finished = true; chunks = []; size = 0; send({ t: "done" }); }
      }
    } catch (err) { send({ t: "error", message: "خدمة التعرّف غير متاحة الآن" }); console.error("[recite]", err.message); }
    busy = false;
    if (stopRequested) { stopRequested = false; await run(true); }
  };
  const timer = setInterval(() => run(false), EVERY);

  ws.on("message", (data, isBinary) => {
    if (!isBinary) {
      try {
        const m = JSON.parse(data.toString());
        if (m.t === "start") {
          // آية واحدة {s,a} أو مدى {s,from,to} (سورة كاملة إن لم يُحدَّد المدى)؛ نحفظ حدود كل آية ليعرف العميل أين هو
          const list = m.a ? [findAyah(m.s, m.a)].filter(Boolean) : suraAyahs(m.s).filter((x) => x.a >= (m.from || 1) && x.a <= (m.to || 999));
          const ayahs = []; expected = [];
          for (const x of list) { const w = words(x.n); ayahs.push({ a: x.a, from: expected.length, to: expected.length + w.length }); expected.push(...w); }
          bounds = ayahs;
          status = expected.map(() => "pending"); finished = false; chunks = []; size = 0;
          send({ t: "ready", words: expected.length, s: m.s, ayahs });
        }
        if (m.t === "stop") { if (busy) stopRequested = true; else run(true); }
      } catch { send({ t: "error", message: "رسالة غير مفهومة" }); }
      return;
    }
    const buf = Buffer.from(data);
    if (loud(buf)) fresh += buf.length;
    chunks.push(buf); size += buf.length;
    while (size > WINDOW && chunks.length > 1) size -= chunks.shift().length; // نافذة منزلقة
  });
  ws.on("close", () => clearInterval(timer));
}

export function attachRecite(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1 << 20 });
  server.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith("/ws/recite")) return;
    if (!userOf(req)) { socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => session(ws));
  });
  return wss;
}
