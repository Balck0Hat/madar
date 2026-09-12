import Figure from "./figure.model.js";
import { notFound } from "../../shared/utils/AppError.js";

// القائمة: بطاقة لكل شخصية بلا القصة (القصة تُطلب وحدها عند الفتح)
const CARD = "-_id figureId name englishName tier born died era region category why hero order";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function list({ era, category, q } = {}) {
  const filter = { published: true };
  if (era) filter.era = era;
  if (category) filter.category = category;
  if (q) {
    const re = new RegExp(escapeRe(q), "i");
    filter.$or = [{ name: re }, { englishName: re }, { why: re }];
  }
  return Figure.find(filter).select(CARD).sort("order").lean();
}

export async function get(figureId) {
  const doc = await Figure.findOne({ figureId, published: true });
  if (!doc) throw notFound("الشخصية غير متاحة", "FIGURE_NOT_FOUND");
  return doc.toPublic();
}

// الزرع: يستبدل الموجود بنسخة الملفات (المحتوى مصدره الملفات لا اللوحة)
export async function seed(figures) {
  const ops = figures.map((f) => ({ updateOne: { filter: { figureId: f.figureId }, update: { $set: f }, upsert: true } }));
  if (ops.length) await Figure.bulkWrite(ops, { ordered: false });
  return ops.length;
}
