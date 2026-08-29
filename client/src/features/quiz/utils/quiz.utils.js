import { norm } from "../../../shared/utils/text";

export const PROMPT = { mcq: "اختر إجابة", tf: "صح أم خطأ؟", fill: "أكمل الفراغ", order: "اضغط العناصر بالترتيب الصحيح", open: "اكتب بكلماتك" };

// هل الإجابة الحالية قابلة للتحقق؟
export function isReady(q, sel) {
  if (sel === null || sel === undefined) return false;
  if (q.t === "order") return sel.length === q.items.length;
  if (q.t === "fill" || q.t === "open") return norm(sel).length > 0;
  return true;
}

// تصحيح الإجابة حسب نوع السؤال
export function checkAnswer(q, sel) {
  switch (q.t) {
    case "mcq":
    case "tf":
      return sel === q.a;
    case "fill":
      return q.a.some((a) => norm(sel) === norm(a) || norm(sel).includes(norm(a)));
    case "order":
      return JSON.stringify(sel) === JSON.stringify(q.a);
    case "open":
      // في النموذج الأولي يُقبل أي جواب بطول معقول؛ التصحيح الذكي في النسخة الكاملة
      return norm(sel).length >= 8;
    default:
      return false;
  }
}

export const PASS_RATIO = 0.7;
export const isPassed = (correct, total) => correct / total >= PASS_RATIO;
