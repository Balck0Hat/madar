import GrammarMark from "./grammarMark.model.js";
import Practice from "./practice.model.js";
import { TREE, TOPICS, topicById, pathOf, bandOf } from "../../shared/data/english/grammar/index.js";
import { notFound } from "../../shared/utils/AppError.js";

// خريطة القواعد: الشجرة كاملة مع إشارات المستخدم وإتقانه لكل موضوع، وموضوع واحد بمحتواه.
const norm = (s) => String(s || "").toLowerCase().replace(/[ً-ْ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

// أفضل نسبة تمرين لكل وسم (الدروس ونقاط الضعف) لتلوين الموضوعات المتقنة
async function masteryByTag(userId) {
  const rows = await Practice.find({ user: userId, kind: { $in: ["lesson", "weak"] }, finishedAt: { $ne: null } }).select("refId score").lean();
  const out = {};
  for (const r of rows) out[r.refId] = Math.max(out[r.refId] ?? 0, r.score?.pct ?? 0);
  return out;
}

export async function tree(userId) {
  const [marks, mastery] = await Promise.all([GrammarMark.find({ user: userId }).select("topicId").lean(), masteryByTag(userId)]);
  const marked = new Set(marks.map((m) => m.topicId));
  return {
    branches: TREE.map((b) => ({ ...b, groups: b.groups.map((g) => ({ ...g, topics: g.topics.map((t) => ({ ...t, band: bandOf(t.level), marked: marked.has(t.id), mastery: t.tag ? mastery[t.tag] ?? null : null })) })) })),
    total: TOPICS.size, marked: [...marked],
  };
}

export async function topic(userId, id) {
  const t = topicById(id);
  if (!t) throw notFound("الموضوع غير موجود", "TOPIC_NOT_FOUND");
  const marked = Boolean(await GrammarMark.exists({ user: userId, topicId: id }));
  const related = (t.related || []).map((r) => topicById(r)).filter(Boolean).map((r) => ({ id: r.id, title: r.title, level: r.level }));
  return { ...t, band: bandOf(t.level), path: pathOf(id), related, marked };
}

// بحث بالعنوان العربي أو الإنجليزي أو الملخّص؛ يعيد معرّفات مرتّبة (العنوان أولاً)
export function search(q) {
  const needle = norm(q).trim();
  if (!needle) return [];
  const hits = [];
  for (const t of TOPICS.values()) {
    const inTitle = norm(t.title).includes(needle) || t.en.toLowerCase().includes(needle);
    const inBody = !inTitle && (norm(t.summary).includes(needle) || (t.form || []).some((f) => f.toLowerCase().includes(needle)));
    if (inTitle || inBody) hits.push({ id: t.id, title: t.title, en: t.en, level: t.level, score: inTitle ? 2 : 1 });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ar")).slice(0, 30);
}

export async function toggleMark(userId, id) {
  if (!topicById(id)) throw notFound("الموضوع غير موجود", "TOPIC_NOT_FOUND");
  const existing = await GrammarMark.findOne({ user: userId, topicId: id });
  if (existing) { await existing.deleteOne(); return { marked: false }; }
  await GrammarMark.create({ user: userId, topicId: id });
  return { marked: true };
}
