import Unit from "./unit.model.js";
import QuestionStat from "./questionStat.model.js";
import { notFound, forbidden } from "../../shared/utils/AppError.js";
import { sample } from "../../shared/utils/grading.js";
import { unitUnlocked } from "../../shared/utils/unlock.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { cleanUnit } from "./unit.clean.js";
import { snapshotUnit } from "./version.service.js";

// تقدّم المتعلم يُقرأ عبر الوصول المشترك للنماذج (الميزات لا تستورد بعضها)
async function progressOf(userId) {
  if (!userId) return {};
  const doc = await models.Progress().findOne({ user: userId }).select("progress").lean();
  return plainMap(doc?.progress);
}

// وحدة مقفلة تُعطى منها الشرارة وأول بطاقة فقط
function preview(unit) {
  return { ...unit, locked: true, cards: unit.cards.slice(0, 1), questions: [], tryIt: undefined, deep: undefined, thread: undefined, summary: [] };
}
// تاريخ النسخ جزء من واجهة المحتوى: المشرف يمرّ عبر content.service وحده
export { listVersions, getVersion, restoreVersion, snapshotUnit } from "./version.service.js";

// معرّفات الوحدات المنشورة (لتمييز "جاهزة" من "محاكاة" في الواجهة)
export async function listPublishedIds() {
  const docs = await Unit.find({ published: true }).select("unitId").lean();
  return docs.map((d) => d.unitId);
}

export async function getPublishedUnit(unitId, userId) {
  const unit = await Unit.findOne({ unitId, published: true });
  if (!unit) throw notFound("الوحدة غير متاحة", "UNIT_NOT_FOUND");
  const pub = unit.toPublic();
  return unitUnlocked(await progressOf(userId), unitId) ? pub : preview(pub);
}

// اختبار الوحدة: n أسئلة عشوائية من البنك (تُعاد مع الإجابات لعرض التغذية الراجعة فوراً)
export async function pickQuiz(unitId, n = 10, userId) {
  if (!unitUnlocked(await progressOf(userId), unitId)) throw forbidden("أكمل المدار السابق في هذا المجال أولاً", "UNIT_LOCKED");
  const unit = await getPublishedUnit(unitId, userId);
  const questions = sample(unit.questions, n);
  return { unitId, title: unit.title, questions };
}

// بنك الأسئلة الكامل (للتصحيح على الخادم؛ يحمل الكلمات المفتاحية)
export async function questionBank(unitId) {
  const unit = await Unit.findOne({ unitId, published: true }).select("questions").lean();
  return unit ? unit.questions : [];
}

export async function summaries(ids) {
  const docs = await Unit.find({ unitId: { $in: ids }, published: true }).select("unitId title summary").lean();
  return docs.map(({ unitId, title, summary }) => ({ unitId, title, summary }));
}

// أسئلة مغلقة من عدة وحدات (للمراجعة والامتحان)
export async function closedQuestions(unitIds, perUnit) {
  const docs = await Unit.find({ unitId: { $in: unitIds }, published: true }).select("unitId questions").lean();
  return docs.flatMap((d) => sample(d.questions.filter((q) => q.t !== "open"), perUnit).map((q) => ({ ...q, unitId: d.unitId })));
}

export async function recordQuestionResults(unitId, results) {
  if (!results.length) return;
  await QuestionStat.bulkWrite(
    results.map(({ qid, ok }) => ({
      updateOne: { filter: { unitId, qid }, update: { $inc: { asked: 1, wrong: ok ? 0 : 1 } }, upsert: true },
    })),
  );
}

// ── إدارة ──
export const listAllUnits = () => Unit.find().select("unitId title published updatedAt questions.qid").sort("unitId").lean();
export const getUnitForEdit = async (unitId) => {
  const unit = await Unit.findOne({ unitId }).lean();
  if (!unit) throw notFound("الوحدة غير موجودة", "UNIT_NOT_FOUND");
  return unit;
};
// الحفظ يكتب فوق الوحدة، فنلتقط الحالة السابقة أولاً ليبقى التراجع ممكناً
export const upsertUnit = async (unitId, body, userId, note = "") => {
  await snapshotUnit(unitId, userId, note);
  return Unit.findOneAndUpdate({ unitId }, { $set: { ...body, unitId, updatedBy: userId } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
};
// تصدير نظيف: نفس الشكل الذي يقبله الاستيراد، بلا حقول مونغو الداخلية
export const exportUnit = async (unitId) => cleanUnit(await getUnitForEdit(unitId));
export const exportAllUnits = async () => (await Unit.find().sort("unitId").lean()).map(cleanUnit);
export const deleteUnit = async (unitId) => {
  const r = await Unit.deleteOne({ unitId });
  if (!r.deletedCount) throw notFound("الوحدة غير موجودة", "UNIT_NOT_FOUND");
};
// عند الإقلاع: إدراج الناقص فقط (تعديلات المشرف لا تُمس)؛ force يستبدل بنسخة الملف
export async function seedUnits(units, { force = false } = {}) {
  for (const u of units) await Unit.updateOne({ unitId: u.unitId }, force ? { $set: u } : { $setOnInsert: u }, { upsert: true });
}
