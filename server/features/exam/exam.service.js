import mongoose from "mongoose";
import Certificate from "./certificate.model.js";
import ExamAttempt from "./exam.attempt.model.js";
import ExamSession from "./exam.session.model.js";
import { examPool, drawExam, strip } from "./exam.pool.js";
import { grade, feedback } from "./exam.grade.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { stats } from "../../shared/utils/game.js";
import { badRequest, forbidden, notFound } from "../../shared/utils/AppError.js";
import { issue, verify } from "./exam.certificate.js";

export const EXAM_SIZE = 40;
export const PASS_RATIO = 0.8;
export const EXAM_MINUTES = 45;
export const COOLDOWN_DAYS = 30;
const LIMIT_MS = EXAM_MINUTES * 60 * 1000;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const arDate = (d) => new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" }).format(d);
const ring1Ids = (progress) => Object.keys(progress).filter((id) => id.startsWith("center") || id.split("-")[1] === "1");

// المحاولة تُسجَّل عند البدء لا عند التسليم: لولا ذلك لأمكن فتح الامتحان،
// قراءة الأسئلة، ثم تركه بلا تسليم وإعادة الكرّة بلا حدّ.
const recordAttempt = (userId) =>
  ExamAttempt.findOneAndUpdate({ user: userId }, { $set: { lastAttemptAt: new Date() }, $inc: { attempts: 1 } }, { upsert: true, new: true });

// محاولة حيّة: لم تُسلَّم بعد ولم تنتهِ مهلتها
const liveSession = async (userId) => {
  const s = await ExamSession.findOne({ user: userId, submittedAt: null }).lean();
  return s && s.deadline > new Date() ? s : null;
};

const view = (session) => ({
  attemptId: session.attemptId,
  questions: session.questions.map(strip),
  answers: session.answers || [],
  total: session.questions.length,
  minutes: EXAM_MINUTES,
  endsAt: session.deadline,
});

async function load(userId) {
  const [cert, prog, last] = await Promise.all([
    Certificate.findOne({ user: userId }).lean(),
    models.Progress().findOne({ user: userId }).lean(),
    ExamAttempt.findOne({ user: userId }).lean(),
  ]);
  const progress = plainMap(prog?.progress);
  const reopens = last?.lastAttemptAt ? new Date(last.lastAttemptAt.getTime() + COOLDOWN_MS) : null;
  return { cert, progress, reopensAt: reopens && reopens > new Date() ? reopens : null };
}

export async function status(userId) {
  const [{ cert, progress, reopensAt }, live] = await Promise.all([load(userId), liveSession(userId)]);
  return {
    eligible: stats(progress).ring1Done,
    size: EXAM_SIZE,
    minutes: EXAM_MINUTES,
    cooldownDays: COOLDOWN_DAYS,
    reopensAt,
    // محاولة معلّقة تُستأنف: الواجهة تعرض «تابع الامتحان» بدل «ابدأ»
    resumable: live ? { attemptId: live.attemptId, endsAt: live.deadline, answered: (live.answers || []).length } : null,
    certificate: cert ? { code: cert.code, issuedAt: cert.issuedAt, score: cert.score, total: cert.total } : null,
  };
}

// يبدأ محاولة أو يستأنف القائمة. الاستئناف لا يستهلك محاولة جديدة ولا يعيد السحب.
export async function start(userId) {
  const live = await liveSession(userId);
  if (live) return view(live);

  const { cert, progress, reopensAt } = await load(userId);
  if (!stats(progress).ring1Done) throw forbidden("الامتحان يُفتح بعد إكمال المدار الأول كله", "NOT_ELIGIBLE");
  // الدائم قبل المؤقّت: من نال العلامة الكاملة لا ينتظر انقضاء تبريد لا يفيده
  if (cert && cert.score === cert.total) throw badRequest("لديك شهادة بعلامة كاملة، ولا شيء بعدها تحسّنه", "ALREADY_PERFECT");
  if (reopensAt) throw forbidden(`محاولة واحدة كل ${COOLDOWN_DAYS} يوماً. يُعاد فتح الامتحان في ${arDate(reopensAt)}.`, "EXAM_COOLDOWN");

  const pool = await examPool(ring1Ids(progress));
  if (pool.length < EXAM_SIZE) throw badRequest("بنك أسئلة الامتحان غير مكتمل بعد", "NOT_ENOUGH_QUESTIONS");

  const questions = drawExam(pool, EXAM_SIZE);
  const session = {
    user: userId,
    attemptId: new mongoose.Types.ObjectId().toString(),
    questions,
    answers: [],
    startedAt: new Date(),
    deadline: new Date(Date.now() + LIMIT_MS),
    submittedAt: null,
  };
  await ExamSession.findOneAndUpdate({ user: userId }, { $set: session }, { upsert: true });
  await recordAttempt(userId);
  return view(session);
}

// تُحفظ كل إجابة فور إعطائها: إغلاق اللسان أو إعادة تشغيل الخادم لم يعد يضيّعها.
// ما يصل بعد المهلة يُرفض هنا، فالتصحيح لاحقاً يجري على ما حُفظ قبلها.
export async function saveAnswer(userId, attemptId, { unitId, qid, answer }) {
  const session = await ExamSession.findOne({ user: userId, attemptId, submittedAt: null });
  if (!session) throw notFound("المحاولة غير موجودة أو انتهت", "ATTEMPT_NOT_FOUND");
  if (Date.now() > session.deadline.getTime()) throw badRequest("انتهت مهلة الامتحان", "EXAM_EXPIRED");
  if (!session.questions.some((q) => q.unitId === unitId && q.qid === qid)) throw badRequest("سؤال ليس في هذه المحاولة", "NOT_IN_ATTEMPT");

  const at = session.answers.findIndex((a) => a.unitId === unitId && a.qid === qid);
  if (at >= 0) session.answers[at].answer = answer;
  else session.answers.push({ unitId, qid, answer });
  session.markModified("answers");
  await session.save();
  return { saved: true, answered: session.answers.length };
}

// التسليم يصحّح ما حُفظ. انتهاء الوقت لم يعد يلغي المحاولة كلها: كانت
// تُهدر بلا علامة ومع تبريد ثلاثين يوماً، فيُعاقَب المتعلّم مرتين.
export async function submit(userId, attemptId) {
  const session = await ExamSession.findOne({ user: userId, attemptId, submittedAt: null });
  if (!session) throw notFound("المحاولة غير موجودة أو انتهت", "ATTEMPT_NOT_FOUND");
  session.submittedAt = new Date();
  await session.save();

  const expired = Date.now() > session.deadline.getTime();
  const graded = grade(session.questions, session.answers);
  const score = graded.filter((g) => g.ok).length;
  const total = graded.length;
  const passed = score / total >= PASS_RATIO;
  const certificate = passed ? await issue(userId, score, total) : null;
  return {
    score, total, passed, expired, certificate,
    ...feedback(graded, passed),
    reopensAt: passed ? null : new Date(session.startedAt.getTime() + COOLDOWN_MS),
  };
}

export { verify };
