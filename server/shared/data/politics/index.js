import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import SYSTEMS from "./systems.js";

// محتوى قسم السياسة: ملف لكل دولة، وملف لكل عائلة ألقاب، وملف واحد لأنواع الحكم.
// يُحمَّل مرة عند الإقلاع ويُخدَم من الذاكرة: محتوى ثابت مصدره الملفات.
const here = path.dirname(fileURLToPath(import.meta.url));

async function loadDir(name) {
  const dir = path.join(here, name);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort() : [];
  const out = [];
  for (const f of files) out.push((await import(pathToFileURL(path.join(dir, f)).href)).default);
  return out.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export const COUNTRIES = await loadDir("countries");
export const TITLE_FAMILIES = await loadDir("titles");
export { SYSTEMS };
