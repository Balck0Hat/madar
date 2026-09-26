import Practice from "./practice.model.js";
import Placement from "./placement.model.js";
import { PLACEMENT } from "../../shared/data/english/index.js";
import { lessonByTag, writingById } from "../../shared/data/english/tracks/index.js";
import { TAGS } from "../../shared/data/english/tags.js";
import { notFound, AppError } from "../../shared/utils/AppError.js";
import { gradeQuestion, stripQuestion, scorePractice } from "./tracks.logic.js";
import { gradeWriting, describeTask } from "./writing.grader.js";
import { attemptView } from "./tracks.service.js";

const badRequest = (m) => new AppError(m, 400, "PRACTICE_BAD_STEP");
const WEAK_ITEMS = 10;
const G = new Map(PLACEMENT.grammar.map((i) => [i.id, i]));

// درس: الشرح كاملاً، والأسئلة بلا إجابات
export function getLesson(tag) {
  const l = lessonByTag(tag);
  if (!l) throw notFound("الدرس غير موجود", "LESSON_NOT_FOUND");
  return { ...l, qs: l.qs.map(stripQuestion) };
}

// سؤال تمرين بمعرّفه: lesson:<tag>#<i> من الدرس، وإلا من بنك القواعد بالوسم
function itemOf(id) {
  if (id.startsWith("lesson:")) { const [tag, i] = id.slice(7).split("#"); return lessonByTag(tag)?.qs[Number(i)] || null; }
  return G.get(id) || null;
}

// أسئلة نقطة الضعف: عشرة من البنك بالوسم نفسه، ويُفضَّل ما لم يره المستخدم في اختبار أو تمرين سابق
async function weakItems(userId, tag) {
  const lesson = lessonByTag(tag);
  const pool = [...PLACEMENT.grammar.filter((i) => i.tag === tag), ...(lesson?.qs || []).map((q, i) => ({ ...q, id: `lesson:${tag}#${i}`, tag }))];
  if (!pool.length) throw notFound("لا أسئلة لهذا الموضوع", "TAG_NOT_FOUND");
  const [placements, attempts] = await Promise.all([
    Placement.find({ user: userId }).select("grammar.ids").lean(),
    Practice.find({ user: userId, kind: "weak", refId: tag }).select("itemIds").lean(),
  ]);
  const seen = new Set([...placements.flatMap((p) => p.grammar?.ids || []), ...attempts.flatMap((a) => a.itemIds)]);
  const shuffle = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const fresh = shuffle(pool.filter((i) => !seen.has(i.id))), rest = shuffle(pool.filter((i) => seen.has(i.id)));
  return [...fresh, ...rest].slice(0, WEAK_ITEMS);
}

export async function startPractice(userId, kind, ref) {
  let items;
  if (kind === "lesson") { const l = lessonByTag(ref); if (!l) throw notFound("الدرس غير موجود", "LESSON_NOT_FOUND"); items = l.qs.map((q, i) => ({ ...q, id: `lesson:${ref}#${i}` })); }
  else items = await weakItems(userId, ref);
  await Practice.updateMany({ user: userId, kind, refId: ref, finishedAt: null }, { $set: { finishedAt: new Date() } });
  const a = await Practice.create({ user: userId, kind, track: "general", refId: ref, itemIds: items.map((i) => i.id) });
  return { attempt: attemptView(a), items: items.map((i) => ({ ...stripQuestion(i), id: i.id })), label: TAGS[ref]?.label || lessonByTag(ref)?.title || ref };
}

// إجابة سؤال تمرين واحد؛ حين تكتمل الأسئلة تُحسب النسبة وتُغلق المحاولة
export async function answerPractice(userId, attemptId, { itemId, choice }) {
  const a = await Practice.findOne({ _id: attemptId, user: userId, kind: { $in: ["lesson", "weak"] } });
  if (!a) throw notFound("المحاولة غير موجودة", "PRACTICE_NOT_FOUND");
  if (a.finishedAt) throw badRequest("انتهت هذه المحاولة");
  const q = itemOf(itemId);
  if (!q || !a.itemIds.includes(itemId) || a.answers.some((x) => x.itemId === itemId)) throw badRequest("سؤال غير متوقع");
  const r = gradeQuestion(q, choice);
  a.answers.push({ itemId, k: q.tag || "lesson", type: "mc", choice, score: r.score, correct: r.score === 1, skipped: false });
  const done = a.answers.length >= a.itemIds.length;
  if (done) { a.score = scorePractice(a.answers); a.finishedAt = new Date(); }
  await a.save();
  return { correct: r.score === 1, a: r.a, why: q.why, done, score: a.score };
}

export function getWritingTask(id) {
  const w = writingById(id);
  if (!w) throw notFound("المهمة غير موجودة", "TASK_NOT_FOUND");
  return w;
}

// مهمة كتابة: تُحفظ فوراً ويُصحّحها النموذج في الخلفية بمعيار المهمة
export async function submitWriting(userId, taskId, text) {
  const w = getWritingTask(taskId);
  const a = await Practice.create({ user: userId, kind: "writing", track: taskId.startsWith("toefl") ? "toefl" : "ielts", refId: taskId, writing: { text, status: "pending" } });
  gradeInBackground(a._id, w).catch((err) => console.error("[practice] grading failed:", err.message));
  return attemptView(a);
}

async function gradeInBackground(id, w) {
  const a = await Practice.findById(id);
  try {
    const r = await gradeWriting(w.rubric, describeTask(w), a.writing.text);
    Object.assign(a.writing, { band: r.band, criteria: r.criteria, summary: r.summary, corrections: r.corrections, advice: r.advice, status: "done" });
  } catch (err) { a.writing.status = "failed"; console.error("[practice] grader:", err.message); }
  a.finishedAt = new Date(); a.markModified("writing"); await a.save();
}

export async function getAttempt(userId, id) {
  const a = await Practice.findOne({ _id: id, user: userId });
  if (!a) throw notFound("المحاولة غير موجودة", "PRACTICE_NOT_FOUND");
  return attemptView(a);
}

export const writingHistory = (userId, taskId) => Practice.find({ user: userId, kind: "writing", refId: taskId, "writing.status": "done" }).sort("-finishedAt").limit(5).select("writing.band writing.criteria finishedAt").lean();
