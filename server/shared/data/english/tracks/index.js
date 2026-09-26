import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TAG_IDS } from "../tags.js";

// محتوى المسارات: آيلتس وتوفل (وحدات قراءة واستماع ومهام كتابة) والإنجليزية العامة (درس لكل وسم).
// يُحمَّل مرة ويُخدَم من الذاكرة. الملفات الناقصة تُتجاهل حتى تُكتب.
const here = path.dirname(fileURLToPath(import.meta.url));

async function load(rel) {
  const file = path.join(here, rel);
  if (!fs.existsSync(file)) return null;
  return (await import(pathToFileURL(file).href)).default;
}
const list = async (rels) => (await Promise.all(rels.map(load))).filter(Boolean);

export const TRACKS = {
  general: { id: "general", title: "الإنجليزية العامة", text: "درس لكل موضوع: شرح بالعربية، أمثلة، وتمرين قصير. للمستويات A1 إلى B2." },
  ielts: { id: "ielts", title: "آيلتس IELTS", text: "قراءة واستماع أكاديميان بتصحيح فوري ودرجة تقريبية، وكتابة يصحّحها النموذج بمعايير الممتحن." },
  toefl: { id: "toefl", title: "توفل TOEFL", text: "الشكل الأمريكي: مقاطع أكاديمية، محاضرات ومحادثات جامعية، ونقاش أكاديمي مكتوب." },
};

export const MODULES = {
  ielts: await list(["ielts/reading-1.js", "ielts/listening-1.js"]),
  toefl: await list(["toefl/reading-1.js", "toefl/listening-1.js"]),
};
export const WRITING = { ielts: (await load("ielts/writing.js")) || [], toefl: (await load("toefl/writing.js")) || [] };
export const LESSONS = (await list(TAG_IDS.map((t) => `general/${t}.js`)));

export const moduleById = (id) => Object.values(MODULES).flat().find((m) => m.id === id) || null;
export const writingById = (id) => Object.values(WRITING).flat().find((w) => w.id === id) || null;
export const lessonByTag = (tag) => LESSONS.find((l) => l.tag === tag) || null;

// جداول تقريبية متعارف عليها: الدرجة الخام من 40 → درجة الآيلتس؛ النسبة → درجة توفل من 30
const IELTS_READING = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
const IELTS_LISTENING = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5]];
const fromTable = (table, raw40) => { for (const [min, band] of table) if (raw40 >= min) return band; return 2; };

export function bandFor(kind, raw, total) {
  if (!total) return null;
  const pct = raw / total;
  if (kind === "ielts-reading") return { scale: "ielts", value: fromTable(IELTS_READING, Math.round(pct * 40)) };
  if (kind === "ielts-listening") return { scale: "ielts", value: fromTable(IELTS_LISTENING, Math.round(pct * 40)) };
  if (kind === "toefl-reading" || kind === "toefl-listening") return { scale: "toefl", value: Math.round(pct * 30) };
  return null;
}
