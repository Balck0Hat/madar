import Placement from "./placement.model.js";
import { PLACEMENT, levelIndex } from "../../shared/data/english/index.js";
import { notFound, AppError } from "../../shared/utils/AppError.js";
import { G, R, L, GRACE, view, advance, grade, deadline, finish } from "./placement.flow.js";
import { effectiveLevel, record, ensureOverrides } from "./placement.calibrate.js";
import { gradeWriting } from "./writing.grader.js";

const badRequest = (m) => new AppError(m, 400, "PLACEMENT_BAD_STEP");
const load = async (userId, id) => { const s = await Placement.findOne({ _id: id, user: userId }); if (!s) throw notFound("الجلسة غير موجودة", "PLACEMENT_NOT_FOUND"); return s; };

// مقاطع رآها المستخدم في جلسات سابقة، لتُفضَّل غيرها
async function seenIds(userId, exceptId) {
  const prev = await Placement.find({ user: userId, _id: { $ne: exceptId } }).select("reading.ids listening.ids").lean();
  return new Set(prev.flatMap((p) => [...(p.reading?.ids || []), ...(p.listening?.ids || [])]));
}

// آخر نتيجة مكتملة: منها يبدأ السلّم في الإعادة، وبها تُقارن النتيجة الجديدة
const lastDone = (userId, exceptId) => Placement.findOne({ user: userId, stage: "done", result: { $ne: null }, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }).sort("-finishedAt").select("result.level result.confidence result.range finishedAt").lean();

const expired = (s) => { const d = deadline(s); return d !== null && Date.now() > d + GRACE; };

async function closeExpired(s) {
  advance(s, { seen: await seenIds(s.user, s._id), force: true });
  await s.save();
  return { timedOut: true, next: view(s) };
}

// إنهاء الجلسة مع مقارنة بالنتيجة السابقة
async function complete(s) {
  finish(s);
  const prev = await lastDone(s.user, s._id);
  if (s.result && prev?.result) s.result.previous = { level: prev.result.level, confidence: prev.result.confidence, finishedAt: prev.finishedAt, delta: levelIndex(s.result.level) - levelIndex(prev.result.level) };
  s.markModified("result");
}

export async function current(userId) {
  const s = await Placement.findOne({ user: userId }).sort("-createdAt");
  return s ? view(s) : null;
}

export async function start(userId) {
  if (!PLACEMENT.grammar.length) throw new AppError("بنك الأسئلة غير جاهز", 503, "PLACEMENT_UNAVAILABLE");
  await ensureOverrides();
  const prev = await lastDone(userId);
  const s = await Placement.create({ user: userId, startLevel: prev?.result?.level || "B1" });
  return view(s);
}

export async function answer(userId, id, { itemId, choice }) {
  const s = await load(userId, id);
  if (!["grammar", "reading", "listening"].includes(s.stage)) throw badRequest("هذه المرحلة لا تقبل إجابات");
  if (expired(s)) return closeExpired(s);
  let result, authored;
  if (s.stage === "grammar") {
    const it = G.get(itemId);
    if (!it || s.grammar.ids.includes(itemId)) throw badRequest("سؤال غير متوقع");
    result = grade(it, choice); authored = it.level;
    s.grammar.ids.push(itemId); s.grammar.answers.push({ itemId, level: effectiveLevel(it), correct: result.correct, choice });
    result.why = it.why;
  } else {
    const [pid, qi] = String(itemId).split("#"); const p = (s.stage === "reading" ? R : L).get(pid); const q = p?.qs[Number(qi)];
    if (!q || !s[s.stage].ids.includes(pid) || s[s.stage].answers.some((a) => a.itemId === itemId)) throw badRequest("سؤال غير متوقع");
    result = grade(q, choice); authored = p.level;
    s[s.stage].answers.push({ itemId, level: p.level, correct: result.correct, choice });
    result.why = q.why;
  }
  await record(itemId, authored, result.correct);
  advance(s, { seen: await seenIds(userId, s._id) }); await s.save();
  return { ...result, next: view(s) };
}

// العميل يبلّغ بانتهاء المؤقّت؛ الخادم يتحقق بساعته هو (بتسامح ثلاث ثوانٍ)
export async function timeout(userId, id) {
  const s = await load(userId, id);
  const d = deadline(s);
  if (d === null) return view(s);
  if (Date.now() < d - 3000) throw badRequest("لم ينتهِ الوقت بعد");
  return (await closeExpired(s)).next;
}

// الكتابة: تُصحَّح في الخلفية عبر Claude Code باشتراك صاحب الموقع؛ النتيجة تُحسب فوراً وتُحدَّث بعدها
export async function writing(userId, id, { text, skip }) {
  const s = await load(userId, id);
  if (s.stage !== "writing") throw badRequest("ليست مرحلة الكتابة");
  if (skip) { s.writing.status = "skipped"; await complete(s); await s.save(); return view(s); }
  s.writing.text = text; s.writing.status = "pending"; await complete(s); await s.save();
  gradeInBackground(s._id).catch((err) => console.error("[placement] grading failed:", err.message));
  return view(s);
}

async function gradeInBackground(id) {
  const s = await Placement.findById(id);
  const w = PLACEMENT.writing.find((x) => x.id === s.writing.promptId);
  try {
    const r = await gradeWriting("placement", w?.prompt, s.writing.text);
    Object.assign(s.writing, { cefr: r.cefr, ielts: r.ielts, summary: r.summary, corrections: r.corrections, advice: r.advice, status: "done" });
  } catch (err) { s.writing.status = "failed"; console.error("[placement] grader:", err.message); }
  await complete(s); await s.save();
}

export const history = (userId) => Placement.find({ user: userId, stage: "done" }).sort("-finishedAt").limit(5).select("result.level result.confidence result.range result.ielts result.recommendation result.skills.weak finishedAt writing.cefr writing.ielts").lean();
export { levelIndex };
export { calibrate, loadOverrides } from "./placement.calibrate.js";
