import mongoose from "mongoose";
import Certificate from "./certificate.model.js";
import { models, plainMap } from "../../shared/utils/models.js";
import { stats } from "../../shared/utils/game.js";
import { checkClosed, sample } from "../../shared/utils/grading.js";
import { randomCode } from "../../shared/utils/tokens.js";
import { badRequest, forbidden, notFound } from "../../shared/utils/AppError.js";
import { bus } from "../../shared/utils/events.js";

export const EXAM_SIZE = 30;
export const PASS_RATIO = 0.8;
export const XP_CERT = 500;
const ATTEMPT_TTL_MS = 60 * 60 * 1000;

// محاولات الامتحان الجارية (في الذاكرة؛ تنتهي خلال ساعة)
const attempts = new Map();

const ring1Ids = (progress) => Object.keys(progress).filter((id) => id.startsWith("center") || id.split("-")[1] === "1");

export async function status(userId) {
  const cert = await Certificate.findOne({ user: userId }).lean();
  const prog = await models.Progress().findOne({ user: userId }).lean();
  const st = stats(prog ? plainMap(prog.progress) : {});
  return { eligible: st.ring1Done, certificate: cert ? { code: cert.code, issuedAt: cert.issuedAt, score: cert.score, total: cert.total } : null };
}

// يبدأ محاولة: 30 سؤالاً مغلقاً من وحدات المدار الأول المنشورة (بلا إجابات)
export async function start(userId) {
  const { eligible, certificate } = await status(userId);
  if (certificate) throw badRequest("لديك شهادة بالفعل", "ALREADY_CERTIFIED");
  if (!eligible) throw forbidden("الامتحان يُفتح بعد إكمال المدار الأول كله", "NOT_ELIGIBLE");
  const prog = await models.Progress().findOne({ user: userId }).lean();
  const ids = ring1Ids(plainMap(prog.progress));
  const units = await models.Unit().find({ unitId: { $in: ids }, published: true }).select("unitId questions").lean();
  const pool = units.flatMap((u) => u.questions.filter((q) => q.t !== "open").map((q) => ({ ...q, unitId: u.unitId })));
  if (pool.length < 10) throw badRequest("لا يوجد محتوى كافٍ للامتحان بعد", "NOT_ENOUGH_QUESTIONS");
  const questions = sample(pool, Math.min(EXAM_SIZE, pool.length));
  const attemptId = new mongoose.Types.ObjectId().toString();
  attempts.set(attemptId, { userId: String(userId), questions, startedAt: Date.now() });
  setTimeout(() => attempts.delete(attemptId), ATTEMPT_TTL_MS).unref?.();
  const stripped = questions.map(({ a, keywords, why, ...q }) => q);
  return { attemptId, questions: stripped, total: stripped.length, minutes: 30 };
}

export async function submit(userId, attemptId, answers) {
  const attempt = attempts.get(attemptId);
  if (!attempt || attempt.userId !== String(userId)) throw notFound("المحاولة غير موجودة أو انتهت", "ATTEMPT_NOT_FOUND");
  attempts.delete(attemptId);
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
    bus.emit("xp.grant", { userId, amount: XP_CERT, reason: "شهادة المدار الأول" });
  }
  return { score, total, passed, graded, certificate };
}

export async function verify(code) {
  const cert = await Certificate.findOne({ code }).lean();
  if (!cert) return { valid: false };
  return { valid: true, name: cert.name, issuedAt: cert.issuedAt, score: cert.score, total: cert.total };
}
