import Review from "./review.model.js";
import { INTERVALS, MAX_WRONG_QIDS, daysFor, weakFactor, addWrong, dropWrong, pickReview } from "./reviews.adaptive.js";
import { bus, on } from "../../shared/utils/events.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { notFound } from "../../shared/utils/AppError.js";

export { INTERVALS };
export const XP_REVIEW = 10;
const MAX_DUE = 5;
const QUESTIONS_PER_UNIT = 2;

const inDays = (n) => new Date(Date.now() + n * 864e5);

// الجدولة تتكيّف مع الأداء: النتيجة الضعيفة تُقرّب الموعد، والقوية تُبقي الفواصل الأصلية
export async function schedule(userId, unitId, { score = null, wrongQids = [] } = {}) {
  const due = inDays(daysFor(0, score));
  const update = { $setOnInsert: { stage: 0, due } };
  if (wrongQids.length) update.$set = { wrongQids: wrongQids.slice(0, MAX_WRONG_QIDS) };
  const res = await Review.updateOne({ user: userId, unitId }, update, { upsert: true });
  // وحدة مجدولة سلفاً ظهر فيها ضعف جديد: نسحب الموعد للأمام بدل تركه بعيداً
  if (!res.upsertedCount && weakFactor(score) < 1) await Review.updateOne({ user: userId, unitId, due: { $gt: due } }, { $set: { due } });
}

// المستحق الآن مع سؤالين مغلقين لكل وحدة (أخطاء المتعلم أولاً ثم تكملة عشوائية)
export async function dueList(userId) {
  const due = await Review.find({ user: userId, due: { $lte: new Date() } }).sort("due").limit(MAX_DUE).lean();
  if (!due.length) return { items: [], totalDue: 0 };
  const units = await models.Unit().find({ unitId: { $in: due.map((d) => d.unitId) }, published: true }).select("unitId title questions").lean();
  const byId = Object.fromEntries(units.map((u) => [u.unitId, u]));
  const items = due
    .filter((d) => byId[d.unitId])
    .map((d) => ({
      unitId: d.unitId,
      title: byId[d.unitId].title,
      stage: d.stage,
      questions: pickReview(byId[d.unitId].questions.filter((q) => q.t === "mcq" || q.t === "tf"), d.wrongQids, QUESTIONS_PER_UNIT),
    }));
  const totalDue = await Review.countDocuments({ user: userId, due: { $lte: new Date() } });
  return { items, totalDue };
}

export async function countDue(userId) {
  return Review.countDocuments({ user: userId, due: { $lte: new Date() } });
}

// إجابة صحيحة تدفع المرحلة للأمام؛ خاطئة تعيدها إلى الغد — وتُسجَّل كضعف يقرّب الموعد ويعيد السؤال
export async function answer(userId, unitId, correct, qid = null) {
  const review = await Review.findOne({ user: userId, unitId });
  if (!review) throw notFound("لا توجد مراجعة لهذه الوحدة", "REVIEW_NOT_FOUND");
  const stage = correct ? Math.min(review.stage + 1, INTERVALS.length - 1) : 0;
  review.stage = stage;
  review.wrongQids = correct ? dropWrong(review.wrongQids, qid) : addWrong(review.wrongQids, qid);
  // الخطأ في المراجعة ضعف مؤكّد لا مجرد تخمين: نمرّر نتيجة صفر ليعمل معامل التقريب
  review.due = inDays(daysFor(stage, correct ? null : 0));
  review.lastAnswered = new Date();
  if (correct) review.correctCount += 1; else review.wrongCount += 1;
  await review.save();
  if (correct) bus.emit("xp.grant", { userId, amount: XP_REVIEW, reason: "مراجعة" });
  return { unitId, stage, due: review.due, gain: correct ? XP_REVIEW : 0 };
}

// مستخدمون لديهم مراجعات مستحقة (للتذكير الصباحي)
export async function usersWithDue() {
  return Review.distinct("user", { due: { $lte: new Date() } });
}

// حدث النجاح لا يحمل تفاصيل الأداء اليوم، فنقرأها من التقدّم عبر الوصول المشترك للنماذج
// (الميزات لا تستورد بعضها). إن أثرى المُطلِق الحمولة لاحقاً استُخدمت كما هي.
async function performanceOf(userId, unitId) {
  const doc = await models.Progress().findOne({ user: userId }).select("progress").lean();
  const res = plainMap(doc?.progress)[unitId];
  return { score: res?.total ? res.score / res.total : null, wrongQids: [] };
}

on("unit.passed", async ({ userId, unitId, score, wrongQids }) => {
  const perf = score == null ? await performanceOf(userId, unitId) : { score, wrongQids: wrongQids || [] };
  await schedule(userId, unitId, perf);
});
