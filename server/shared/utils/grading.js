const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export const norm = (s) =>
  (s ?? "").toString().trim().toLowerCase().replace(/[٠-٩]/g, (c) => AR_DIGITS.indexOf(c));

// تصحيح حتمي للأنواع المغلقة؛ الأسئلة المفتوحة تُصحَّح في ai.js
export function checkClosed(q, answer) {
  switch (q.t) {
    case "mcq":
    case "tf":
      return answer === q.a;
    case "fill":
      return (q.a || []).some((a) => norm(answer) === norm(a) || norm(answer).includes(norm(a)));
    case "order":
      return JSON.stringify(answer) === JSON.stringify(q.a);
    default:
      return false;
  }
}

// تصحيح تقريبي للمفتوح عند غياب مفتاح الذكاء الاصطناعي: طول معقول + كلمة مفتاحية واحدة على الأقل
export function heuristicOpen(q, answer) {
  const text = norm(answer);
  if (text.length < 8) return { ok: false, feedback: "الإجابة قصيرة جداً؛ اكتب جملة كاملة." };
  const keys = (q.keywords || []).map(norm).filter(Boolean);
  if (keys.length && !keys.some((k) => text.includes(k))) return { ok: false, feedback: q.why || "الإجابة لا تذكر الفكرة الأساسية." };
  return { ok: true, feedback: "إجابة مقبولة." };
}

export const isOpen = (q) => q.t === "open";

// اختيار n عناصر عشوائية دون تكرار
export function sample(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
