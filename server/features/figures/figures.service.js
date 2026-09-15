import Figure from "./figure.model.js";
import FigureProgress from "./figureProgress.model.js";
import { notFound } from "../../shared/utils/AppError.js";
import { plainMap } from "../../shared/utils/models.js";

// القائمة: بطاقة لكل شخصية بلا القصة (القصة تُطلب وحدها عند الفتح).
// الموضع والصورة فيها لأن الخريطة والبطاقات تحتاجهما.
const CARD = "-_id figureId name englishName tier born died era region category why hero order geo image.src image.thumb";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// البحث بالاسم أولاً، ثم في نصّ القصص عبر الفهرس النصي: «بهستون» يجد داريوس
async function byText(filter, q) {
  try {
    return await Figure.find({ ...filter, $text: { $search: q } }).select(CARD).lean();
  } catch (err) {
    console.error("[figures] text index unavailable:", err.message);
    return [];
  }
}

export async function list({ era, category, q } = {}) {
  const filter = { published: true };
  if (era) filter.era = era;
  if (category) filter.category = category;
  if (!q) return Figure.find(filter).select(CARD).sort("order").lean();
  const re = new RegExp(escapeRe(q), "i");
  const byName = await Figure.find({ ...filter, $or: [{ name: re }, { englishName: re }, { why: re }] }).select(CARD).lean();
  const seen = new Set(byName.map((f) => f.figureId));
  const extra = (await byText(filter, q)).filter((f) => !seen.has(f.figureId));
  return [...byName, ...extra].sort((a, b) => a.order - b.order);
}

export async function get(figureId) {
  const doc = await Figure.findOne({ figureId, published: true });
  if (!doc) throw notFound("الشخصية غير متاحة", "FIGURE_NOT_FOUND");
  return doc.toPublic();
}

// تقدّم القارئ: { read: { figureId: تاريخ }, page: { figureId: رقم } }
export async function getProgress(userId) {
  const doc = await FigureProgress.findOne({ user: userId }).lean();
  return { read: plainMap(doc?.read), page: plainMap(doc?.page) };
}

export async function setProgress(userId, figureId, { page, read } = {}) {
  const set = {};
  if (Number.isInteger(page)) set[`page.${figureId}`] = page;
  if (read) set[`read.${figureId}`] = new Date();
  if (!Object.keys(set).length) return getProgress(userId);
  const doc = await FigureProgress.findOneAndUpdate({ user: userId }, { $set: set }, { new: true, upsert: true, runValidators: true }).lean();
  return { read: plainMap(doc.read), page: plainMap(doc.page) };
}

// الزرع: يستبدل الموجود بنسخة الملفات (المحتوى مصدره الملفات لا اللوحة)
export async function seed(figures) {
  const ops = figures.map((f) => ({ updateOne: { filter: { figureId: f.figureId }, update: { $set: f }, upsert: true } }));
  if (ops.length) await Figure.bulkWrite(ops, { ordered: false });
  return ops.length;
}
