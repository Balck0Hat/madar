import mongoose from "mongoose";
import Certificate from "./certificate.model.js";
import ExamAttempt from "./exam.attempt.model.js";
import { examPool, shuffleOptions, strip } from "./exam.pool.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { stats } from "../../shared/utils/game.js";
import { checkClosed, sample } from "../../shared/utils/grading.js";
import { randomCode } from "../../shared/utils/tokens.js";
import { badRequest, forbidden, notFound } from "../../shared/utils/AppError.js";
import { bus } from "../../shared/utils/events.js";

export const EXAM_SIZE = 40;
export const PASS_RATIO = 0.8;
export const XP_CERT = 500;
export const EXAM_MINUTES = 45;
export const COOLDOWN_DAYS = 30;
const LIMIT_MS = EXAM_MINUTES * 60 * 1000;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
// المحاولة تُحفظ في الذاكرة قليلاً بعد المهلة حتى يُردّ المتأخر برسالة واضحة لا بـ«غير موجودة»
const ATTEMPT_TTL_MS = LIMIT_MS + 10 * 60 * 1000;

const attempts = new Map();
const arDate = (d) => new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" }).format(d);

const ring1Ids = (progress) => Object.keys(progress).filter((id) => id.startsWith("center") || id.split("-")[1] === "1");

// المحاولة تُسجَّل عند البدء لا عند التسليم: لولا ذلك لأمكن فتح الامتحان، قراءة الأسئلة،
// ثم تركه بلا تسليم وإعادة الكرّة بلا حدّ.
const recordAttempt = (userId) =>
  ExamAttempt.findOneAndUpdate({ user: userId }, { $set: { lastAttemptAt: new Date() }, $inc: { attempts: 1 } }, { upsert: true, new: true });

// قراءة واحدة تخدم status وstart معاً: التقدّم يُقرأ مرة، فلا يتغيّر بينهما
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
  const { cert, progress, reopensAt } = await load(userId);
  return {
    eligible: stats(progress).ring1Done,
    size: EXAM_SIZE,
    minutes: EXAM_MINUTES,
    cooldownDays: COOLDOWN_DAYS,
    reopensAt,
    certificate: cert ? { code: cert.code, issuedAt: cert.issuedAt, score: cert.score, total: cert.total } : null,
  };
}

// يبدأ محاولة: 40 سؤالاً من البنك المحجوز، مخلوطة سؤالاً وخياراتٍ، بلا إجابات
export async function start(userId) {
  const { cert, progress, reopensAt } = await load(userId);
  if (cert) throw badRequest("لديك شهادة بالفعل", "ALREADY_CERTIFIED");
  if (!stats(progress).ring1Done) throw forbidden("الامتحان يُفتح بعد إكمال المدار الأول كله", "NOT_ELIGIBLE");
  if (reopensAt) throw forbidden(`محاولة واحدة كل ${COOLDOWN_DAYS} يوماً. يُعاد فتح الامتحان في ${arDate(reopensAt)}.`, "EXAM_COOLDOWN");

  const pool = await examPool(ring1Ids(progress));
  if (pool.length < EXAM_SIZE) throw badRequest("بنك أسئلة الامتحان غير مكتمل بعد", "NOT_ENOUGH_QUESTIONS");

  const questions = sample(pool, EXAM_SIZE).map(shuffleOptions);
  const attemptId = new mongoose.Types.ObjectId().toString();
  const deadline = Date.now() + LIMIT_MS;
  attempts.set(attemptId, { userId: String(userId), questions, startedAt: Date.now(), deadline });
  setTimeout(() => attempts.delete(attemptId), ATTEMPT_TTL_MS).unref?.();
  await recordAttempt(userId);
  return { attemptId, questions: questions.map(strip), total: questions.length, minutes: EXAM_MINUTES, endsAt: new Date(deadline) };
}

export async function submit(userId, attemptId, answers) {
  const attempt = attempts.get(attemptId);
  if (!attempt || attempt.userId !== String(userId)) throw notFound("المحاولة غير موجودة أو انتهت", "ATTEMPT_NOT_FOUND");
  attempts.delete(attemptId);
  if (Date.now() > attempt.deadline)
    throw badRequest(`انتهت مهلة الامتحان (${EXAM_MINUTES} دقيقة) قبل التسليم، ولم تُحتسب هذه المحاولة.`, "EXAM_EXPIRED");

  const byKey = new Map(answers.map((a) => [`${a.unitId}:${a.qid}`, a.answer]));
  const graded = attempt.questions.map((q) => ({ unitId: q.unitId, qid: q.qid, ok: checkClosed(q, byKey.get(`${q.unitId}:${q.qid}`)), a: q.a, why: q.why }));
  const score = graded.filter((g) => g.ok).length, total = graded.length;
  const passed = score / total >= PASS_RATIO;
  let certificate = null;
  if (passed) {
    const user = await models.User().findById(userId).select("name").lean();
    const code = `MDR-${new Date().getFullYear()}-${randomCode(5)}`;
    const doc = await Certificate.create({ user: userId, code, name: user.name, score, total });
    certificate = { code: doc.code, issuedAt: doc.issuedAt, score, total };
    bus.emit("xp.grant", { userId, amount: XP_CERT, reason: "شهادة إتمام المدار الأول" });
  }
  // التبريد يبدأ من لحظة فتح المحاولة (وهي لحظة تسجيلها)، لا من لحظة التسليم
  return { score, total, passed, graded, certificate, reopensAt: passed ? null : new Date(attempt.startedAt + COOLDOWN_MS) };
}

export async function verify(code) {
  const cert = await Certificate.findOne({ code }).lean();
  if (!cert) return { valid: false };
  return { valid: true, name: cert.name, issuedAt: cert.issuedAt, score: cert.score, total: cert.total, proctored: false };
}
