import Review from "./review.model.js";
import { bus, on } from "../../shared/utils/events.js";
import { models } from "../../shared/utils/models.js";
import { sample } from "../../shared/utils/grading.js";
import { notFound } from "../../shared/utils/AppError.js";

// فواصل المراجعة بالأيام حسب المرحلة: غداً، ثم 3، ثم 7، ثم 30، ثم كل 90
export const INTERVALS = [1, 3, 7, 30, 90];
export const XP_REVIEW = 10;
const MAX_DUE = 5;
const QUESTIONS_PER_UNIT = 2;

const inDays = (n) => new Date(Date.now() + n * 864e5);

export async function schedule(userId, unitId) {
  await Review.updateOne({ user: userId, unitId }, { $setOnInsert: { stage: 0, due: inDays(INTERVALS[0]) } }, { upsert: true });
}

// المستحق الآن مع سؤالين مغلقين لكل وحدة (من بنك الأسئلة)
export async function dueList(userId) {
  const due = await Review.find({ user: userId, due: { $lte: new Date() } }).sort("due").limit(MAX_DUE).lean();
  if (!due.length) return { items: [], totalDue: 0 };
  const units = await models.Unit().find({ unitId: { $in: due.map((d) => d.unitId) }, published: true }).select("unitId title questions").lean();
  const byId = Object.fromEntries(units.map((u) => [u.unitId, u]));
  const items = due
    .filter((d) => byId[d.unitId])
    .map((d) => ({ unitId: d.unitId, title: byId[d.unitId].title, stage: d.stage, questions: sample(byId[d.unitId].questions.filter((q) => q.t === "mcq" || q.t === "tf"), QUESTIONS_PER_UNIT) }));
  const totalDue = await Review.countDocuments({ user: userId, due: { $lte: new Date() } });
  return { items, totalDue };
}

export async function countDue(userId) {
  return Review.countDocuments({ user: userId, due: { $lte: new Date() } });
}

// إجابة صحيحة تدفع المرحلة للأمام؛ خاطئة تعيدها إلى الغد
export async function answer(userId, unitId, correct) {
  const review = await Review.findOne({ user: userId, unitId });
  if (!review) throw notFound("لا توجد مراجعة لهذه الوحدة", "REVIEW_NOT_FOUND");
  const stage = correct ? Math.min(review.stage + 1, INTERVALS.length - 1) : 0;
  review.stage = stage;
  review.due = inDays(INTERVALS[stage]);
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

on("unit.passed", ({ userId, unitId }) => schedule(userId, unitId));
