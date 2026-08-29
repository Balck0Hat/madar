import Progress from "./progress.model.js";
import { parseUnitId } from "../../shared/utils/units.js";
import { applyFinish, streakFrom } from "../../shared/utils/game.js";
import { badRequest } from "../../shared/utils/AppError.js";

// مفتاح الأسبوع (الاثنين هو أول أيام الأسبوع) لإعادة ضبط نقاط الدوري
export function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 864e5 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

async function loadDoc(userId) {
  let doc = await Progress.findOne({ user: userId });
  if (!doc) doc = await Progress.create({ user: userId, weekKey: weekKey() });
  const wk = weekKey();
  if (doc.weekKey !== wk) { doc.weekKey = wk; doc.weeklyXp = 0; }
  // السلسلة تُعاد حسابها عند كل قراءة لتنقطع إذا مرّ يوم بلا دراسة
  doc.streak = streakFrom(doc.studied);
  if (doc.isModified()) await doc.save();
  return doc;
}

export async function getState(userId) {
  const doc = await loadDoc(userId);
  return doc.toState();
}

export async function finishUnit(userId, unitId, { correct, total, sim }) {
  const parsed = parseUnitId(unitId);
  if (!parsed) throw badRequest("معرّف وحدة غير صالح", "BAD_UNIT");
  const doc = await loadDoc(userId);
  const { next, result } = applyFinish(doc.toState(), { unitId, ring: parsed.ring, correct, total, sim });
  doc.progress = new Map(Object.entries(next.progress));
  doc.attempts = new Map(Object.entries(next.attempts));
  doc.xp = next.xp;
  doc.weeklyXp = next.weeklyXp;
  doc.badges = next.badges;
  doc.studied = next.studied;
  doc.streak = next.streak;
  await doc.save();
  return { state: doc.toState(), result };
}
