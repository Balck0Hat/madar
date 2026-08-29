import DailyAnswer from "./dailyAnswer.model.js";
import { models } from "../../shared/utils/models.js";
import { dayKey, streakFrom } from "../../shared/utils/game.js";
import { checkClosed } from "../../shared/utils/grading.js";
import { bus } from "../../shared/utils/events.js";
import { notFound } from "../../shared/utils/AppError.js";

export const XP_CHALLENGE = 20;

// بذرة من تاريخ اليوم: كل المستخدمين يحصلون على السؤال نفسه دون تخزينه
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// وحدة واحدة ثم سؤال مغلق واحد منها، كلاهما مشتق من مفتاح اليوم (لا عشوائية)
export async function questionOfDay(day = dayKey()) {
  const Unit = models.Unit();
  // الشرط نفسه المطبَّق أدناه: لولا استثناء المحجوز هنا لاختيرت وحدة كل مغلقاتها امتحانية فتخرج قائمة فارغة
  const hasClosed = { published: true, questions: { $elemMatch: { t: { $ne: "open" }, examOnly: { $ne: true } } } };
  // نجلب المعرّفات وحدها أولاً: تحميل بنوك الأسئلة كلها في كل طلب مكلف بلا داعٍ
  const ids = await Unit.find(hasClosed).select("unitId").sort("unitId").lean();
  if (!ids.length) return null;
  const { unitId } = ids[hash(day) % ids.length];
  const unit = await Unit.findOne({ unitId }).select("unitId title questions").lean();
  const closed = unit.questions.filter((q) => q.t !== "open" && q.examOnly !== true).sort((a, b) => a.qid.localeCompare(b.qid));
  const question = closed[hash(`${day}:${unitId}`) % closed.length];
  return { day, unitId, unitTitle: unit.title, question };
}

// النسخة المعروضة: بلا إجابة ولا شرح ولا كلمات مفتاحية
const publicView = ({ unitId, unitTitle, question }) => ({
  unitId,
  unitTitle,
  qid: question.qid,
  t: question.t,
  q: question.q,
  ...(question.opts?.length ? { opts: question.opts } : {}),
  ...(question.items?.length ? { items: question.items } : {}),
});

// السلسلة = أيام مشاركة متتالية (لا أيام إجابة صحيحة) لتشجيع الاستمرار
async function statsFor(userId, day) {
  const mine = await DailyAnswer.find({ user: userId }).select("day correct").lean();
  const todayRow = mine.find((r) => r.day === day) || null;
  return {
    answeredToday: Boolean(todayRow),
    correctToday: todayRow ? todayRow.correct : null,
    totalAnswered: mine.length,
    streak: streakFrom(mine.map((r) => r.day)),
  };
}

export async function todayChallenge(userId) {
  const day = dayKey();
  const picked = await questionOfDay(day);
  const stats = await statsFor(userId, day);
  return { day, question: picked ? publicView(picked) : null, ...stats };
}

export async function answerToday(userId, answer) {
  const day = dayKey();
  const picked = await questionOfDay(day);
  if (!picked) throw notFound("لا يوجد تحدٍ اليوم", "NO_CHALLENGE");
  const { question } = picked;
  const reveal = { a: question.a, why: question.why || "" };
  const existing = await DailyAnswer.findOne({ user: userId, day }).lean();
  // إعادة الإرسال تُعيد النتيجة المخزَّنة نفسها ولا تدفع نقاطاً ثانية
  if (existing) return { correct: existing.correct, ...reveal, repeated: true, stats: await statsFor(userId, day) };
  const correct = checkClosed(question, answer);
  try {
    await DailyAnswer.create({ user: userId, day, qid: question.qid, correct });
  } catch (err) {
    if (err.code !== 11000) throw err;
    // سباق بين طلبين متزامنين: الفهرس الفريد حسم الأمر، نعيد المخزَّن
    const saved = await DailyAnswer.findOne({ user: userId, day }).lean();
    return { correct: saved.correct, ...reveal, repeated: true, stats: await statsFor(userId, day) };
  }
  if (correct) bus.emit("xp.grant", { userId: String(userId), amount: XP_CHALLENGE, reason: "تحدي اليوم" });
  return { correct, ...reveal, repeated: false, gain: correct ? XP_CHALLENGE : 0, stats: await statsFor(userId, day) };
}
