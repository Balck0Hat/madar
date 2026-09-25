import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// الكتب: مجلد لكل كتاب فيه book.js وفصول NN-slug.js. تُحمَّل مرة وتُخدَم من الذاكرة.
const here = path.dirname(fileURLToPath(import.meta.url));

async function loadBook(dir) {
  const bookFile = path.join(dir, "book.js");
  if (!fs.existsSync(bookFile)) return null;
  const book = (await import(pathToFileURL(bookFile).href)).default;
  const chapters = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^\d\d-.*\.js$/.test(x)).sort()) {
    chapters.push((await import(pathToFileURL(path.join(dir, f)).href)).default);
  }
  chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
  return { ...book, chapters };
}

export async function loadBooks() {
  const dirs = fs.readdirSync(here, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path.join(here, d.name));
  const books = (await Promise.all(dirs.map(loadBook))).filter(Boolean);
  return books.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export const BOOKS = await loadBooks();
