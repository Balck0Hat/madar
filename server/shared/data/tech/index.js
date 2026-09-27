import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BRANCHES, TOPIC_IDS, LEVELS, LEVEL_LABELS } from "./tree.js";

// خريطة التقنية: الشجرة من tree.js، ومحتوى كل موضوع من topics/<branch>.js. تُحمَّل مرة وتُخدَم من الذاكرة.
const here = path.dirname(fileURLToPath(import.meta.url));

async function load(branch) {
  const file = path.join(here, "topics", `${branch}.js`);
  if (!fs.existsSync(file)) return [];
  return (await import(pathToFileURL(file).href)).default;
}

const lists = await Promise.all(BRANCHES.map((b) => load(b.id)));
export const TOPICS = new Map(lists.flat().map((t) => [t.id, t]));

// أسئلة المقابلة: interview/<branch>.js يصدّر { topicId: [ { q, level, a, hint } ] }
async function loadInterview(branch) {
  const file = path.join(here, "interview", `${branch}.js`);
  if (!fs.existsSync(file)) return {};
  return (await import(pathToFileURL(file).href)).default;
}
const interviews = await Promise.all(BRANCHES.map((b) => loadInterview(b.id)));
export const INTERVIEW = new Map(interviews.flatMap((obj) => Object.entries(obj)));
export const interviewOf = (id) => INTERVIEW.get(id) || [];
export const interviewOfBranch = (branchId) => { const b = BRANCHES.find((x) => x.id === branchId); if (!b) return null; return b.groups.map((g) => ({ id: g.id, title: g.title, topics: g.topics.filter((id) => TOPICS.has(id)).map((id) => ({ id, title: TOPICS.get(id).title, questions: interviewOf(id) })) })); };

// الشجرة للعميل: كل موضوع بعنوانه ومستواه وملخصه وهل محتواه جاهز، بلا المحتوى نفسه
export const TREE = BRANCHES.map((b) => ({
  id: b.id, title: b.title, en: b.en, hue: b.hue,
  groups: b.groups.map((g) => ({ id: g.id, title: g.title, en: g.en, topics: g.topics.map((id) => { const t = TOPICS.get(id); return { id, title: t?.title || id, en: t?.en || "", level: t?.level || null, summary: t?.summary || "", ready: Boolean(t), questions: (INTERVIEW.get(id) || []).length }; }) })),
}));

export const topicById = (id) => TOPICS.get(id) || null;
export const pathOf = (id) => { for (const b of BRANCHES) for (const g of b.groups) if (g.topics.includes(id)) return { branch: { id: b.id, title: b.title, hue: b.hue }, group: { id: g.id, title: g.title } }; return null; };
// السابق والتالي داخل المجموعة نفسها، للتنقل من صفحة الموضوع
export const neighbours = (id) => { const p = pathOf(id); if (!p) return {}; const g = BRANCHES.find((b) => b.id === p.branch.id).groups.find((x) => x.id === p.group.id); const i = g.topics.indexOf(id); const pick = (k) => (g.topics[k] && TOPICS.get(g.topics[k]) ? { id: g.topics[k], title: TOPICS.get(g.topics[k]).title } : null); return { prev: pick(i - 1), next: pick(i + 1) }; };
export { BRANCHES, TOPIC_IDS, LEVELS, LEVEL_LABELS };
