import Progress from "./progress.model.js";
import { parseUnitId } from "../../shared/utils/units.js";
import { applyFinish, applyFreeze, streakFrom, dayKey } from "../../shared/utils/game.js";
import { checkClosed, isOpen } from "../../shared/utils/grading.js";
import { gradeOpen } from "../../shared/utils/ai.js";
import { models } from "../../shared/utils/models.js";
import { badRequest } from "../../shared/utils/AppError.js";
import { bus, on } from "../../shared/utils/events.js";
import { weekKey } from "../../shared/utils/week.js";

async function loadDoc(userId) {
  let doc = await Progress.findOne({ user: userId });
  if (!doc) doc = await Progress.create({ user: userId, weekKey: weekKey() });
  const wk = weekKey();
  if (doc.weekKey !== wk) { doc.weekKey = wk; doc.weeklyXp = 0; }
  // تجميد السلسلة إن لزم، ثم إعادة حساب السلسلة لتنقطع إذا مرّ يوم بلا دراسة
  const frozen = applyFreeze(doc.toState());
  doc.frozenDays = frozen.frozenDays; doc.freezes = frozen.freezes;
  doc.streak = streakFrom(doc.studied, doc.frozenDays);
  if (doc.isModified()) await doc.save();
  return doc;
}

export async function getState(userId) {
  return (await loadDoc(userId)).toState();
}

// أقصى عدد قيود في سجل النقاط: يكفي لأكثر من أربعة أشهر ويمنع انتفاخ الوثيقة
const XP_LOG_CAP = 120;

// قيد واحد لكل يوم: تُجمَّع مكاسب اليوم في القيد الأخير بدل إضافة صف لكل حدث
function logXp(doc, amount) {
  if (!amount) return;
  const day = dayKey();
  const last = doc.xpLog[doc.xpLog.length - 1];
  if (last && last.day === day) last.amount += amount;
  else doc.xpLog.push({ day, amount });
  if (doc.xpLog.length > XP_LOG_CAP) doc.xpLog.splice(0, doc.xpLog.length - XP_LOG_CAP);
}

// يحفظ موضع القراءة داخل وحدة ليكمل المستخدم من حيث توقّف
export async function setResume(userId, unitId, card) {
  const doc = await loadDoc(userId);
  doc.resume.set(unitId, card);
  await doc.save();
  return { unitId, card };
}

// يصحّح الإجابات من بنك الأسئلة (المغلقة حتمياً والمفتوحة بالذكاء الاصطناعي)
async function grade(unitId, answers) {
  const bank = await models.Unit().findOne({ unitId, published: true }).select("questions").lean();
  if (!bank) throw badRequest("هذه الوحدة لا تملك اختباراً بعد", "NO_QUIZ");
  const byId = new Map(bank.questions.map((q) => [q.qid, q]));
  const graded = [];
  for (const { qid, answer } of answers) {
    const q = byId.get(qid);
    if (!q) continue;
    if (isOpen(q)) { const r = await gradeOpen(q, String(answer ?? "")); graded.push({ qid, ok: r.ok, feedback: r.feedback, source: r.source }); }
    else graded.push({ qid, ok: checkClosed(q, answer) });
  }
  if (!graded.length) throw badRequest("لا إجابات صالحة", "NO_ANSWERS");
  models.QuestionStat().bulkWrite(graded.map(({ qid, ok }) => ({ updateOne: { filter: { unitId, qid }, update: { $inc: { asked: 1, wrong: ok ? 0 : 1 } }, upsert: true } }))).catch((err) => console.error("[stats]", err.message));
  return graded;
}

export async function finishUnit(userId, unitId, { answers, correct, total, sim }) {
  const parsed = parseUnitId(unitId);
  if (!parsed) throw badRequest("معرّف وحدة غير صالح", "BAD_UNIT");
  let graded = null;
  if (answers) { graded = await grade(unitId, answers); correct = graded.filter((g) => g.ok).length; total = graded.length; }
  const doc = await loadDoc(userId);
  const { next, result } = applyFinish(doc.toState(), { unitId, ring: parsed.ring, correct, total, sim });
  Object.assign(doc, { xp: next.xp, weeklyXp: next.weeklyXp, badges: next.badges, studied: next.studied, streak: next.streak, freezes: next.freezes });
  doc.progress = new Map(Object.entries(next.progress));
  doc.attempts = new Map(Object.entries(next.attempts));
  logXp(doc, result.gain);
  // الوحدة اجتُيزت: لم يعد لموضع القراءة معنى
  if (result.passed) doc.resume.delete(unitId);
  await doc.save();
  if (result.passed && result.fresh) bus.emit("unit.passed", { userId: String(userId), unitId });
  return { state: doc.toState(), result: { ...result, graded } };
}

export async function grantXp(userId, amount) {
  const doc = await loadDoc(userId);
  doc.xp += amount; doc.weeklyXp += amount;
  logXp(doc, amount);
  await doc.save();
  return doc.toState();
}

// مستخدمون لم يدرسوا اليوم ولديهم سلسلة (للتذكير المسائي)
export async function usersAtRiskOfStreak(todayKey) {
  return Progress.find({ streak: { $gt: 0 }, studied: { $ne: todayKey } }).select("user").lean().then((d) => d.map((x) => x.user));
}

on("xp.grant", ({ userId, amount }) => grantXp(userId, amount));
