import { align, words } from "../../shared/utils/arabic.js";

// دمج تعرّف جديد في حالة الآية. المبادئ:
// - المطابقة تبدأ من قرب موضع القارئ لا من أول الآية، فما مضى خرج من نافذة الصوت.
// - الكلمة التي سُمعت مرة تبقى خضراء مهما تغيّر التعرّف بعدها.
// - الخطأ لا يُعلن إلا بعد أن يتجاوزه القارئ بكلمتين، فلا يرتجف اللون مع كل إعادة.
export const cursorOf = (status) => {
  const p = status.indexOf("pending");
  const m = status.indexOf("miss");
  if (p === -1) return status.length;
  return m === -1 ? p : Math.min(p, m);
};

export function mergeStatus(status, expected, text, lookback = 2) {
  const next = status.slice();
  const from = Math.max(0, cursorOf(next) - lookback);
  const r = align(expected.slice(from), words(text));
  r.status.forEach((st, k) => {
    const i = from + k;
    if (next[i] === "ok") return;
    if (st === "ok") next[i] = "ok";
    else if (st === "miss" && r.status.slice(k + 2).includes("ok")) next[i] = "miss";
  });
  const ok = next.filter((x) => x === "ok").length;
  const miss = next.filter((x) => x === "miss").length;
  return { status: next, cursor: cursorOf(next), ok, miss, done: expected.length > 0 && ok + miss === expected.length };
}
