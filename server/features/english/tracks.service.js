import Practice from "./practice.model.js";
import Placement from "./placement.model.js";
import { TRACKS, MODULES, WRITING, LESSONS, moduleById } from "../../shared/data/english/tracks/index.js";
import { TAGS } from "../../shared/data/english/tags.js";
import { notFound, AppError } from "../../shared/utils/AppError.js";
import { stripQuestion, gradeSection, scoreModule } from "./tracks.logic.js";

const badRequest = (m) => new AppError(m, 400, "PRACTICE_BAD_STEP");

// ما يُعرض من وحدة: الأقسام بلا إجابات، ومسار الصوت للاستماع (النص يبقى احتياطاً لقراءة المتصفح)
export function moduleView(m) {
  return { ...m, sections: m.sections.map((s) => ({ ...s, qs: s.qs.map(stripQuestion), ...(s.lines ? { audio: `/audio/english/${m.id}-${s.id}.mp3` } : {}) })) };
}

const bestOf = (list) => list.reduce((b, a) => (!b || (a.score?.pct ?? -1) > (b.score?.pct ?? -1) ? a : b), null);

// نظرة عامة: المسارات ووحداتها مع أفضل نتيجة للمستخدم، والدروس مع أفضل تمرين، ونقاط ضعفه من آخر تحديد مستوى
export async function overview(userId) {
  const done = await Practice.find({ user: userId, finishedAt: { $ne: null } }).select("kind track refId score writing.status writing.band finishedAt").sort("-finishedAt").lean();
  const by = (kind, refId) => done.filter((a) => a.kind === kind && a.refId === refId);
  const modules = (track) => (MODULES[track] || []).map((m) => {
    const best = bestOf(by("module", m.id));
    return { id: m.id, title: m.title, skill: m.skill, minutes: m.minutes, questions: m.sections.reduce((n, s) => n + s.qs.length, 0), sections: m.sections.length, attempts: by("module", m.id).length, best: best?.score || null };
  });
  const writing = (track) => (WRITING[track] || []).map((w) => {
    const last = by("writing", w.id).find((a) => a.writing?.status === "done");
    return { id: w.id, title: w.title, task: w.task, minutes: w.minutes, words: w.words, attempts: by("writing", w.id).length, last: last ? { band: last.writing.band, at: last.finishedAt } : null };
  });
  const lessons = LESSONS.map((l) => { const best = bestOf(by("lesson", l.tag)); return { tag: l.tag, title: l.title, level: l.level, minutes: l.minutes, best: best?.score || null }; });
  const placement = await Placement.findOne({ user: userId, stage: "done", result: { $ne: null } }).sort("-finishedAt").select("result.level result.skills.weak result.recommendation finishedAt").lean();
  const weakHistory = {};
  for (const a of done.filter((x) => x.kind === "weak")) (weakHistory[a.refId] ||= []).unshift({ pct: a.score?.pct ?? 0, at: a.finishedAt });
  const weak = (placement?.result?.skills?.weak || []).map((w) => ({ tag: w.key, label: TAGS[w.key]?.label || w.label, rate: w.rate, history: weakHistory[w.key] || [], hasLesson: LESSONS.some((l) => l.tag === w.key) }));
  const practised = Object.keys(weakHistory).filter((t) => !weak.some((w) => w.tag === t)).map((t) => ({ tag: t, label: TAGS[t]?.label || t, history: weakHistory[t], hasLesson: LESSONS.some((l) => l.tag === t) }));
  return {
    tracks: [
      { ...TRACKS.general, lessons },
      { ...TRACKS.ielts, modules: modules("ielts"), writing: writing("ielts") },
      { ...TRACKS.toefl, modules: modules("toefl"), writing: writing("toefl") },
    ],
    placement: placement ? { level: placement.result.level, track: placement.result.recommendation?.track, at: placement.finishedAt } : null,
    weak, practised,
  };
}

export async function getModule(userId, id) {
  const m = moduleById(id);
  if (!m) throw notFound("الوحدة غير موجودة", "MODULE_NOT_FOUND");
  const attempt = await Practice.findOne({ user: userId, kind: "module", refId: id, finishedAt: null }).sort("-createdAt");
  return { module: moduleView(m), attempt: attempt ? attemptView(attempt) : null };
}

export const attemptView = (a) => ({ id: String(a._id), kind: a.kind, track: a.track, refId: a.refId, doneSections: a.doneSections, answers: a.answers, score: a.score, startedAt: a.startedAt, finishedAt: a.finishedAt || null, writing: a.writing });

export async function startModule(userId, id) {
  const m = moduleById(id);
  if (!m) throw notFound("الوحدة غير موجودة", "MODULE_NOT_FOUND");
  await Practice.updateMany({ user: userId, kind: "module", refId: id, finishedAt: null }, { $set: { finishedAt: new Date() } }); // المحاولات المعلّقة تُغلق
  const a = await Practice.create({ user: userId, kind: "module", track: m.track, refId: id });
  return attemptView(a);
}

// تسليم قسم كاملاً: تُصحَّح أسئلته دفعة، وحين تكتمل الأقسام تُحسب الدرجة والتقدير
export async function submitSection(userId, attemptId, { sectionId, answers }) {
  const a = await Practice.findOne({ _id: attemptId, user: userId, kind: "module" });
  if (!a) throw notFound("المحاولة غير موجودة", "PRACTICE_NOT_FOUND");
  if (a.finishedAt) throw badRequest("انتهت هذه المحاولة");
  const m = moduleById(a.refId);
  const section = m.sections.find((s) => s.id === sectionId);
  if (!section || a.doneSections.includes(sectionId)) throw badRequest("قسم غير متوقع");
  const graded = gradeSection(section, answers);
  a.answers.push(...graded.map(({ why, a: key, ...g }) => g));
  a.doneSections.push(sectionId);
  const done = a.doneSections.length === m.sections.length;
  if (done) { a.score = scoreModule(m, a.answers); a.finishedAt = new Date(); }
  await a.save();
  return { graded, done, score: a.score, attempt: attemptView(a) };
}
