import { align, words } from "../../shared/utils/arabic.js";

// دمج تعرّف جديد في حالة الآية. المبادئ:
// - المطابقة تبدأ من قرب موضع القارئ لا من أول الآية، فما مضى خرج من نافذة الصوت.
// - الكلمة التي سُمعت مرة تبقى خضراء مهما تغيّر التعرّف بعدها.
// - الخطأ لا يُعلن إلا بعد أن يتجاوزه القارئ بكلمتين، فلا يرتجف اللون مع كل إعادة.
// المؤشر على أول كلمة لم تُقرأ بعد؛ الفائتة حمراء أصلاً ولا يقف القارئ عندها
export const cursorOf = (status) => { const p = status.indexOf("pending"); return p === -1 ? status.length : p; };

const applyAlign = (next, from, r) => {
  r.status.forEach((st, k) => {
    const i = from + k;
    if (next[i] === "ok") return;
    if (st === "ok") next[i] = "ok";
    else if (st === "miss" && r.status.slice(k + 2).includes("ok")) next[i] = "miss";
  });
};
const summary = (next, expected) => {
  const ok = next.filter((x) => x === "ok").length;
  const miss = next.filter((x) => x === "miss").length;
  return { status: next, cursor: cursorOf(next), ok, miss, done: expected.length > 0 && ok + miss === expected.length };
};

// lookahead: سورة كاملة قد تكون آلاف الكلمات، والنافذة الصوتية لا تحمل أكثر من عشرات، فالمطابقة محلية
export function mergeStatus(status, expected, text, lookback = 3, lookahead = 80) {
  const next = status.slice();
  const from = Math.max(0, cursorOf(next) - lookback);
  applyAlign(next, from, align(expected.slice(from, from + lookahead), words(text)));
  return summary(next, expected);
}

// المتسلسل: لا يتقدّم إلا داخل الآية التي فيها القارئ. كلام من آية أبعد لا
// يُحتسب ولا يلوّن شيئاً؛ والآية لا تُغلق إلا إن اكتملت أو بدأ القارئ التي
// بعدها فعلاً (سُمع أول كلمتين منها)، فتُعدّ بقيتها فائتة ويُنتقل.
export function mergeSequential(status, expected, text, bounds, lookback = 3) {
  const next = status.slice();
  const hyp = words(text);
  const cur = cursorOf(next);
  let b = bounds.find((x) => cur >= x.from && cur < x.to);
  if (!b) return summary(next, expected);
  const from = Math.max(b.from, cur - lookback);
  applyAlign(next, from, align(expected.slice(from, b.to), hyp));
  const open = (x) => next.slice(x.from, x.to).includes("pending");
  const after = (x) => bounds.find((y) => y.from === x.to);
  // اكتملت الآية في هذه الدفعة والقارئ مستمر: تابع في التي بعدها من التعرّف نفسه
  while (!open(b) && after(b)) {
    const n = after(b);
    const r = align(expected.slice(n.from, n.to), hyp);
    if (r.ok === 0) break;
    applyAlign(next, n.from, r);
    b = n;
  }
  const stillOpen = open(b);
  const nextB = after(b);
  if (stillOpen && nextB) {
    const head = align(expected.slice(nextB.from, Math.min(nextB.to, nextB.from + 3)), hyp);
    if (head.ok >= 2) { // بدأ التي بعدها: أغلق الحالية وتقدّم
      for (let i = b.from; i < b.to; i++) if (next[i] === "pending") next[i] = "miss";
      applyAlign(next, nextB.from, head);
    }
  }
  return summary(next, expected);
}

// هل في التعرّف ما يخصّ الآية القريبة؟ الضجيج والأنفاس تُخرج كلاماً لا علاقة له
export const relevant = (status, expected, text, span = 12) => {
  const cur = cursorOf(status);
  return align(expected.slice(Math.max(0, cur - 2), cur + span), words(text)).ok > 0;
};
