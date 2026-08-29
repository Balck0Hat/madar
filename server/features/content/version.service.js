import mongoose from "mongoose";
import Unit from "./unit.model.js";
import UnitVersion from "./unitVersion.model.js";
import { notFound } from "../../shared/utils/AppError.js";
import { cleanUnit, unitCounts, OPTIONAL_KEYS } from "./unit.clean.js";

// حد النسخ المحفوظة لكل وحدة: يكفي للتراجع عن سلسلة تعديلات دون تضخيم القاعدة
export const MAX_VERSIONS = 20;

// يلتقط الحالة الحالية قبل الكتابة فوقها. يعيد null إن كانت الوحدة جديدة
// (لا شيء لنحفظه)، فلا يُنشئ نسخة فارغة عند أول إنشاء.
export async function snapshotUnit(unitId, editedBy, note = "") {
  const current = await Unit.findOne({ unitId }).lean();
  if (!current) return null;
  const last = await UnitVersion.findOne({ unitId }).sort("-version").select("version").lean();
  const snapshot = cleanUnit(current);
  const doc = await UnitVersion.create({
    unitId,
    version: (last?.version || 0) + 1,
    snapshot,
    counts: unitCounts(snapshot),
    editedBy: editedBy || current.updatedBy || null,
    note: String(note || "").slice(0, 200),
  });
  await pruneVersions(unitId);
  return doc;
}

// يحذف ما تجاوز MAX_VERSIONS (الأقدم أولاً) بعد كل لقطة جديدة
export async function pruneVersions(unitId, keep = MAX_VERSIONS) {
  const extra = await UnitVersion.find({ unitId }).sort("-version").skip(keep).select("_id").lean();
  if (extra.length) await UnitVersion.deleteMany({ _id: { $in: extra.map((v) => v._id) } });
  return extra.length;
}

// أسماء المحرّرين باستعلام $in واحد؛ لا populate لأن نموذج المستخدم
// قد لا يكون مسجّلاً حين تُستدعى الخدمة خارج التطبيق (سكربت أو اختبار وحدة)
async function editorNames(ids) {
  const User = mongoose.models.User;
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (!User || !unique.length) return new Map();
  const users = await User.find({ _id: { $in: unique } }).select("name").lean();
  return new Map(users.map((u) => [String(u._id), u.name]));
}

// القائمة لا تحمل اللقطة نفسها: العدّادات تكفي لعرض «ما الذي تغيّر»
export async function listVersions(unitId) {
  const rows = await UnitVersion.find({ unitId }).sort("-version").select("version counts note createdAt editedBy").lean();
  const names = await editorNames(rows.map((r) => r.editedBy));
  return rows.map((r) => ({
    version: r.version,
    note: r.note || "",
    createdAt: r.createdAt,
    cards: r.counts?.cards || 0,
    questions: r.counts?.questions || 0,
    editedBy: names.get(String(r.editedBy)) || null,
  }));
}

async function findVersion(unitId, version) {
  const doc = await UnitVersion.findOne({ unitId, version }).lean();
  if (!doc) throw notFound("لا توجد نسخة بهذا الرقم", "VERSION_NOT_FOUND");
  return doc;
}

export async function getVersion(unitId, version) {
  const doc = await findVersion(unitId, version);
  const names = await editorNames([doc.editedBy]);
  return { version: doc.version, note: doc.note || "", createdAt: doc.createdAt, editedBy: names.get(String(doc.editedBy)) || null, unit: cleanUnit(doc.snapshot) };
}

// الاستعادة تلتقط الحالة الحالية أولاً حتى تكون هي نفسها قابلة للتراجع
export async function restoreVersion(unitId, version, userId) {
  const doc = await findVersion(unitId, version);
  await snapshotUnit(unitId, userId, `قبل استعادة النسخة ${version}`);
  const body = cleanUnit(doc.snapshot);
  // ما غاب عن اللقطة يُحذف من الوثيقة، وإلا بقيت حقول اختيارية من الحالة الأحدث
  const unset = Object.fromEntries(OPTIONAL_KEYS.filter((k) => body[k] === undefined).map((k) => [k, ""]));
  const update = { $set: { ...body, unitId, updatedBy: userId } };
  if (Object.keys(unset).length) update.$unset = unset;
  return Unit.findOneAndUpdate({ unitId }, update, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
}
