import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// شخصيات التاريخ: ملف لكل شخصية في people/، يُحمَّل كما تُحمَّل وحدات المنهج
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "people");

export async function loadFigures() {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort() : [];
  const out = [];
  for (const file of files) {
    const { default: figure } = await import(pathToFileURL(path.join(dir, file)).href);
    out.push({ published: true, ...figure });
  }
  return out;
}

export const FIGURES = await loadFigures();
