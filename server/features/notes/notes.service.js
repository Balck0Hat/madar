import Note from "./note.model.js";
import { conflict, notFound } from "../../shared/utils/AppError.js";

// سقف لكل مستخدم: يحمي القاعدة من تظليل آلي أو مكرَّر، ورقم كبير كفاية لقارئ جاد
export const MAX_NOTES = 500;
// حدّ ما يعود في قائمة «كل تظليلاتي» حتى لا نُرجع مجموعة كاملة دفعة واحدة
const LIST_LIMIT = 300;

const shape = (n) => ({
  id: String(n._id),
  unitId: n.unitId,
  page: n.page,
  text: n.text,
  note: n.note || "",
  color: n.color,
  createdAt: n.createdAt,
});

export async function create(userId, { unitId, page, text, note, color }) {
  const count = await Note.countDocuments({ user: userId });
  if (count >= MAX_NOTES) {
    throw conflict(`بلغت الحد الأقصى للتظليلات (${MAX_NOTES}). احذف بعضها قبل إضافة جديد.`, "NOTES_LIMIT");
  }
  const doc = await Note.create({ user: userId, unitId, page, text, note, color });
  return shape(doc);
}

// بلا unitId تعود كل تظليلات المستخدم (الأحدث أولاً) لصفحة «تظليلاتي»
export async function list(userId, unitId) {
  const filter = unitId ? { user: userId, unitId } : { user: userId };
  const notes = await Note.find(filter).sort("-createdAt").limit(LIST_LIMIT).lean();
  return { notes: notes.map(shape), total: notes.length };
}

// الفلترة بـ user في نفس الاستعلام: لا يستطيع مستخدم تعديل أو حذف تظليل غيره
export async function update(userId, id, note) {
  const doc = await Note.findOneAndUpdate({ _id: id, user: userId }, { note }, { new: true, runValidators: true }).lean();
  if (!doc) throw notFound("التظليل غير موجود", "NOTE_NOT_FOUND");
  return shape(doc);
}

export async function remove(userId, id) {
  const doc = await Note.findOneAndDelete({ _id: id, user: userId }).lean();
  if (!doc) throw notFound("التظليل غير موجود", "NOTE_NOT_FOUND");
  return { id: String(doc._id) };
}
