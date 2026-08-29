import QuizAttempt, { ATTEMPT_TTL_SECONDS } from "./quizAttempt.model.js";
import { sample } from "../../shared/utils/grading.js";
import { aiEnabled } from "../../shared/utils/ai.js";
import { unitUnlocked } from "../../shared/utils/unlock.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { badRequest, forbidden, notFound } from "../../shared/utils/AppError.js";
import { on } from "../../shared/utils/events.js";

export const ATTEMPT_TTL_MS = ATTEMPT_TTL_SECONDS * 1000;

// بوابة الفتح تُطبَّق هنا أيضاً: بدء محاولة طلبٌ مباشر يتجاوز قفل الواجهة
async function ensureUnlocked(userId, unitId) {
  const doc = await models.Progress().findOne({ user: userId }).select("progress").lean();
  if (!unitUnlocked(plainMap(doc?.progress), unitId)) throw forbidden("أكمل المدار السابق في هذا المجال أولاً", "UNIT_LOCKED");
}

// بلا نموذج ذكي يُقيّم المتعلم نفسه، فتُرسل الكلمات المفتاحية لتكون جزءاً من الإجابة النموذجية
// (لا خطر منها: السؤال المفتوح لا يدخل في النجاح). مع النموذج تُحجب ويُصحَّح على الخادم.
function forLearner(q) {
  const { keywords, ...rest } = q;
  if (q.t !== "open") return rest;
  return aiEnabled() ? rest : { ...rest, self: true, keywords: keywords || [] };
}

async function draw(unitId, n) {
  const unit = await models.Unit().findOne({ unitId, published: true }).select("questions").lean();
  if (!unit?.questions?.length) throw badRequest("هذه الوحدة لا تملك اختباراً بعد", "NO_QUIZ");
  return sample(unit.questions, n).map(forLearner);
}

const expired = (attempt) => Date.now() - new Date(attempt.startedAt).getTime() >= ATTEMPT_TTL_MS;
const toPublic = (a) => ({ unitId: a.unitId, questions: a.questions, answers: (a.answers || []).map(({ qid, answer, selfMark }) => ({ qid, answer, selfMark })), startedAt: a.startedAt });

// يستأنف المحاولة المفتوحة بنفس أسئلتها، أو يسحب مجموعة جديدة إن لم توجد
export async function startAttempt(userId, unitId, n = 10) {
  await ensureUnlocked(userId, unitId);
  const open = await QuizAttempt.findOne({ user: userId, unitId });
  // TTL في مونغو يمسح بخيط دوري متأخر؛ نتحقق من العمر هنا كي لا تُستأنف محاولة ميتة
  if (open && !expired(open)) return toPublic(open);
  if (open) await QuizAttempt.deleteOne({ _id: open._id });
  const questions = await draw(unitId, n);
  try {
    return toPublic(await QuizAttempt.create({ user: userId, unitId, questions, startedAt: new Date() }));
  } catch (err) {
    // سباق بين طلبين متزامنين: الفهرس الفريد يحسمه، ونعيد المحاولة الفائزة لا مجموعة ثانية
    if (err?.code !== 11000) throw err;
    const winner = await QuizAttempt.findOne({ user: userId, unitId });
    if (!winner) throw err;
    return toPublic(winner);
  }
}

// يسجّل إجابة واحدة فور كتابتها حتى لا يضيع التقدّم عند مغادرة الشاشة
export async function saveAnswer(userId, unitId, { qid, answer, selfMark }) {
  const attempt = await QuizAttempt.findOne({ user: userId, unitId });
  if (!attempt || expired(attempt)) throw notFound("لا توجد محاولة مفتوحة لهذه الوحدة", "NO_ATTEMPT");
  if (!attempt.questions.some((q) => q?.qid === qid)) throw badRequest("هذا السؤال ليس ضمن محاولتك", "QID_NOT_IN_ATTEMPT");
  const entry = { qid, answer, selfMark };
  const at = attempt.answers.findIndex((a) => a.qid === qid);
  if (at >= 0) attempt.answers.set(at, entry);
  else attempt.answers.push(entry);
  await attempt.save();
  return { qid, answered: attempt.answers.length, total: attempt.questions.length };
}

export const dropAttempt = (userId, unitId) => QuizAttempt.deleteOne({ user: userId, unitId });

// انتهت الوحدة (نجاحاً أو رسوباً): المحاولة استُهلكت، وإعادة المحاولة تستحق أسئلة جديدة
on("unit.finished", ({ userId, unitId }) => dropAttempt(userId, unitId));
