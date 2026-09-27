import TechMark from "./techMark.model.js";
import { TREE, TOPICS, BRANCHES, topicById, pathOf, neighbours, interviewOf, interviewOfBranch } from "../../shared/data/tech/index.js";
import { notFound } from "../../shared/utils/AppError.js";

// قسم التقنية: الشجرة كاملة مع إشارات المستخدم، وموضوع واحد بمحتواه، وبحث، ومفضلة.
const norm = (s) => String(s || "").toLowerCase().replace(/[ً-ْ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

export async function tree(userId) {
  const marks = await TechMark.find({ user: userId }).select("topicId").lean();
  const marked = new Set(marks.map((m) => m.topicId));
  return {
    branches: TREE.map((b) => ({ ...b, groups: b.groups.map((g) => ({ ...g, topics: g.topics.map((t) => ({ ...t, marked: marked.has(t.id) })) })) })),
    total: TOPICS.size, marked: [...marked],
  };
}

export async function topic(userId, id) {
  const t = topicById(id);
  if (!t) throw notFound("الموضوع غير موجود", "TOPIC_NOT_FOUND");
  const marked = Boolean(await TechMark.exists({ user: userId, topicId: id }));
  const related = (t.related || []).map((r) => topicById(r)).filter(Boolean).map((r) => ({ id: r.id, title: r.title, level: r.level }));
  return { ...t, path: pathOf(id), related, marked, interview: interviewOf(id), ...neighbours(id) };
}

// أسئلة مقابلة قسم كامل، مجموعةً فموضوعاً
export function interview(branchId) {
  const groups = interviewOfBranch(branchId);
  if (!groups) throw notFound("القسم غير موجود", "BRANCH_NOT_FOUND");
  const b = BRANCHES.find((x) => x.id === branchId);
  return { branch: { id: b.id, title: b.title, en: b.en, hue: b.hue }, groups, total: groups.reduce((n, g) => n + g.topics.reduce((m, t) => m + t.questions.length, 0), 0) };
}

// بحث بالعنوان العربي أو الإنجليزي أو الملخّص أو المصطلحات؛ العنوان أولاً
export function search(q) {
  const needle = norm(q).trim();
  if (!needle) return [];
  const hits = [];
  for (const t of TOPICS.values()) {
    const inTitle = norm(t.title).includes(needle) || t.en.toLowerCase().includes(needle);
    const inBody = !inTitle && (norm(t.summary).includes(needle) || (t.terms || []).some((x) => x.en.toLowerCase().includes(needle) || norm(x.ar).includes(needle)));
    if (inTitle || inBody) hits.push({ id: t.id, title: t.title, en: t.en, level: t.level, score: inTitle ? 2 : 1 });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ar")).slice(0, 30);
}

export async function toggleMark(userId, id) {
  if (!topicById(id)) throw notFound("الموضوع غير موجود", "TOPIC_NOT_FOUND");
  const existing = await TechMark.findOne({ user: userId, topicId: id });
  if (existing) { await existing.deleteOne(); return { marked: false }; }
  await TechMark.create({ user: userId, topicId: id });
  return { marked: true };
}
