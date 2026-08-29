import { unitBody, checkStructure } from "../content/content.validation.js";
import * as content from "../content/content.service.js";

// حقول مونغو التي قد تأتي في ملف مُصدَّر من نسخة أقدم: تُتجاهل لا تُرفض
const INTERNAL = ["_id", "__v", "createdAt", "updatedAt", "updatedBy"];

// تقرير وحدة واحدة: زود أولاً (الأنواع والحدود العليا) ثم القواعد البنيوية (الاكتمال).
// نجمع كل الأخطاء ولا نتوقف عند أولها، لأن المستورد يريد قائمة يصلحها دفعة واحدة.
export function checkImportUnit(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { unitId: null, ok: false, errors: ["ليست وحدة صالحة"], body: null };
  const { unitId } = raw;
  if (typeof unitId !== "string" || !unitId.trim()) return { unitId: null, ok: false, errors: ["لا معرّف للوحدة (unitId)"], body: null };
  const body = { ...raw };
  for (const key of [...INTERNAL, "unitId"]) delete body[key];
  const parsed = unitBody.strict().safeParse(body);
  const errors = parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".") || "الجسم"}: ${i.message}`);
  errors.push(...checkStructure({ ...(parsed.success ? parsed.data : body), unitId }));
  return { unitId, ok: !errors.length, errors, body: parsed.success ? parsed.data : null };
}

// بلا force: إما كل الوحدات أو لا شيء — استيراد نصف ملف يترك المحتوى في حالة ملتبسة.
// مع force: تُستورد الصالحة وتُبلَّغ البقية. مع dryRun: فحص فقط، لتعرض الواجهة
// التقرير قبل أن يكتب المشرف فوق أي وحدة.
export async function importUnits(units, { force = false, dryRun = false } = {}, userId) {
  const reports = units.map(checkImportUnit);
  const valid = reports.filter((r) => r.ok);
  const applied = !dryRun && (force || valid.length === reports.length);
  if (applied) for (const r of valid) await content.upsertUnit(r.unitId, r.body, userId, "استيراد JSON");
  return {
    applied,
    dryRun,
    imported: applied ? valid.length : 0,
    failed: reports.length - valid.length,
    reports: reports.map(({ unitId, ok, errors }) => ({ unitId, ok, errors })),
  };
}
