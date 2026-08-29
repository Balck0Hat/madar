import { sample } from "../../shared/utils/grading.js";

// فواصل المراجعة بالأيام حسب المرحلة: غداً، ثم 3، ثم 7، ثم 30، ثم كل 90
export const INTERVALS = [1, 3, 7, 30, 90];

// أداء قوي = الفواصل الأصلية كما هي (لا انحدار في سلوك من يتقن).
// دونها نضرب الفاصل بمعامل مشتق من النتيجة، بحدٍّ أدنى ثلث المدة كي لا تصير المراجعة إزعاجاً.
export const STRONG_SCORE = 0.9;
export const MIN_FACTOR = 1 / 3;
// سقف قائمة الأخطاء لكل وحدة: يكفي لملء مراجعات عدة ويمنع انتفاخ الوثيقة
export const MAX_WRONG_QIDS = 8;

export function weakFactor(score) {
  if (score == null || !Number.isFinite(score) || score >= STRONG_SCORE) return 1;
  return Math.max(MIN_FACTOR, Math.min(1, score / STRONG_SCORE));
}

// أيام (كسرية) حتى المراجعة القادمة؛ الكسر مقصود ليعود الضعيف خلال ساعات لا أيام
export const daysFor = (stage, score) => INTERVALS[Math.min(Math.max(stage, 0), INTERVALS.length - 1)] * weakFactor(score);

// قائمة أخطاء مرتّبة بالأحدث: الخطأ الأخير أولى بإعادة السؤال
export function addWrong(list = [], qid) {
  if (!qid) return [...list];
  return [qid, ...list.filter((x) => x !== qid)].slice(0, MAX_WRONG_QIDS);
}

// أجاب صحيحاً بعد خطأ سابق: يخرج السؤال من قائمة ضعفه
export const dropWrong = (list = [], qid) => (qid ? list.filter((x) => x !== qid) : [...list]);

// أسئلة المراجعة: ما أخطأ فيه المتعلم فعلاً أولاً، ثم تُكمَّل عشوائياً من بقية البنك
export function pickReview(questions, wrongQids = [], n = 2) {
  const weakSet = new Set(wrongQids);
  const weak = sample(questions.filter((q) => weakSet.has(q.qid)), n);
  if (weak.length >= n) return weak;
  return [...weak, ...sample(questions.filter((q) => !weakSet.has(q.qid)), n - weak.length)];
}
