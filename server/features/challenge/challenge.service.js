import DailyAnswer from "./dailyAnswer.model.js";
import { models } from "../../shared/utils/models.js";
import { dayKey, streakFrom } from "../../shared/utils/game.js";
import { checkClosed } from "../../shared/utils/grading.js";
import { bus } from "../../shared/utils/events.js";
import { notFound } from "../../shared/utils/AppError.js";

export const XP_CHALLENGE = 20;

// مولّد زائف حتمي: يخلط قائمة بترتيب يعتمد على بذرة وحدها
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, seed) {
  const out = [...list];
  const rnd = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// مفتاح يوم غير صالح يجب ألا يُسقط التحدّي: نعود إلى اليوم الحالي بدل NaN
const dayNumber = (day) => {
  const t = Date.parse(`${day}T00:00:00Z`);
  return Math.floor((Number.isNaN(t) ? Date.now() : t) / 86400000);
};

// المركز والمدار الأول وحدهما: التحدي مشترك بين كل المتعلّمين، فلا يصحّ أن
// يُسأل المبتدئ عن مادة المدار الثالث. هذه الوحدات هي القاسم المشترك بينهم.
const inPool = (unitId) => unitId.startsWith("center") || unitId.split("-")[1] === "1";

// وحدة واحدة ثم سؤال مغلق واحد منها، كلاهما مشتق من اليوم (لا عشوائية).
// دورة كاملة قبل أي تكرار: القسمة على بصمة رقمية كانت تُكتّل الاختيار، فتظهر
// وحدة خمس مرات في السنة وتغيب عشرات غيرها كلياً.
export async function questionOfDay(day = dayKey()) {
  const Unit = models.Unit();
  // الشرط نفسه المطبَّق أدناه: لولا استثناء المحجوز هنا لاختيرت وحدة كل مغلقاتها امتحانية فتخرج قائمة فارغة
  const hasClosed = { published: true, questions: { $elemMatch: { t: { $ne: "open" }, examOnly: { $ne: true } } } };
  // نجلب المعرّفات وحدها أولاً: تحميل بنوك الأسئلة كلها في كل طلب مكلف بلا داعٍ
  const all = await Unit.find(hasClosed).select("unitId").sort("unitId").lean();
  // البذور وحدها إن لم يُنشر المدار الأول بعد: بركة فارغة تعني لا تحدّي أصلاً
  const ids = all.map((d) => d.unitId).filter(inPool);
  const pool = ids.length ? ids : all.map((d) => d.unitId);
  if (!pool.length) return null;

  const n = dayNumber(day);
  // ترتيب جديد لكل دورة، فلا يحفظ المواظب تسلسل الدورة الماضية
  const unitId = shuffled(pool, Math.floor(n / pool.length))[((n % pool.length) + pool.length) % pool.length];

  const unit = await Unit.findOne({ unitId }).select("unitId title questions").lean();
  const closed = unit.questions.filter((q) => q.t !== "open" && q.examOnly !== true).sort((a, b) => a.qid.localeCompare(b.qid));
  const question = shuffled(closed, n)[0];
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
