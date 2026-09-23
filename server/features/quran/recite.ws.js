import { WebSocketServer } from "ws";
import cookie from "cookie";
import { verifyAccess } from "../../shared/utils/tokens.js";
import { ACCESS_COOKIE } from "../../shared/utils/cookies.js";
import { align, words } from "../../shared/utils/arabic.js";
import { ayah as findAyah } from "../../shared/data/quran/index.js";
import { env } from "../../shared/config/env.js";

// التسميع المباشر: المتصفح يرسل صوتاً خاماً (PCM 16 بت، 16 كيلوهرتز) قطعةً كل
// نصف ثانية؛ نحتفظ بآخر عشر ثوانٍ ونرسلها كل ثانية ونصف لخدمة التعرّف المحلية،
// ونحاذي النصّ مع كلمات الآية المطلوبة ونعيد حالة كل كلمة. لا يُحفظ الصوت.
const RATE = 16000;
const WINDOW = 10 * RATE * 2; // بايتات: عشر ثوانٍ
const EVERY = 1500;
const ASR = env.asrUrl || "http://127.0.0.1:3106";

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
  let target = null;
  let chunks = [];
  let size = 0;
  let busy = false;
  let heardAll = ""; // ما تراكم من النصّ عبر النوافذ، ليبقى ما سُمع سابقاً محسوباً
  const send = (o) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(o));

  const run = async () => {
    if (busy || !size || !expected.length) return;
    busy = true;
    try {
      const text = await transcribe(Buffer.concat(chunks));
      const r = align(expected, [...words(heardAll), ...words(text)]);
      send({ t: "state", text, ...r });
      if (r.done) { heardAll = ""; chunks = []; size = 0; send({ t: "done" }); }
      else if (size >= WINDOW) heardAll = `${heardAll} ${text}`.trim(); // النافذة ستنزلق: احفظ ما فيها
    } catch (err) { send({ t: "error", message: "خدمة التعرّف غير متاحة الآن" }); console.error("[recite]", err.message); }
    busy = false;
  };
  const timer = setInterval(run, EVERY);

  ws.on("message", (data, isBinary) => {
    if (!isBinary) {
      try {
        const m = JSON.parse(data.toString());
        if (m.t === "start") { target = findAyah(m.s, m.a); expected = target ? words(target.n) : []; chunks = []; size = 0; heardAll = ""; send({ t: "ready", words: expected.length, s: m.s, a: m.a }); }
        if (m.t === "stop") { run(); chunks = []; size = 0; heardAll = ""; }
      } catch { send({ t: "error", message: "رسالة غير مفهومة" }); }
      return;
    }
    chunks.push(Buffer.from(data)); size += data.length;
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
