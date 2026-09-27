import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BRANCHES, TOPIC_IDS, LEVEL_BANDS } from "./tree.js";

// خريطة القواعد: الشجرة من tree.js، ومحتوى كل موضوع من topics/<branch>.js. تُحمَّل مرة وتُخدَم من الذاكرة.
const here = path.dirname(fileURLToPath(import.meta.url));

async function load(branch) {
  const file = path.join(here, "topics", `${branch}.js`);
  if (!fs.existsSync(file)) return [];
  return (await import(pathToFileURL(file).href)).default;
}

const lists = await Promise.all(BRANCHES.map((b) => load(b.id)));
export const TOPICS = new Map(lists.flat().map((t) => [t.id, t]));

// الشجرة للعميل: كل موضوع بعنوانه ومستواه ووسمه وهل محتواه جاهز، بلا المحتوى نفسه
export const TREE = BRANCHES.map((b) => ({
  id: b.id, title: b.title, en: b.en, hue: b.hue,
  groups: b.groups.map((g) => ({ id: g.id, title: g.title, en: g.en, topics: g.topics.map((id) => { const t = TOPICS.get(id); return { id, title: t?.title || id, en: t?.en || "", level: t?.level || null, tag: t?.tag || null, summary: t?.summary || "", ready: Boolean(t) }; }) })),
}));

export const bandOf = (level) => Object.keys(LEVEL_BANDS).find((k) => LEVEL_BANDS[k].includes(level)) || null;
export const topicById = (id) => TOPICS.get(id) || null;
export const pathOf = (id) => { for (const b of BRANCHES) for (const g of b.groups) if (g.topics.includes(id)) return { branch: { id: b.id, title: b.title, en: b.en, hue: b.hue }, group: { id: g.id, title: g.title, en: g.en } }; return null; };
export { BRANCHES, TOPIC_IDS, LEVEL_BANDS };
