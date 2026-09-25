import { BOOKS } from "../../shared/data/books/index.js";
import BookProgress from "./bookProgress.model.js";
import { notFound } from "../../shared/utils/AppError.js";
import { plainMap } from "../../shared/utils/models.js";

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const chapterWords = (c) => words(c.hook) + (c.sections || []).reduce((n, s) => n + words(s.p), 0);

// بطاقة الكتاب: كل شيء إلا نصوص الفصول
const card = ({ chapters, ...b }) => ({ ...b, chapters: chapters.length, minutes: Math.round(chapters.reduce((n, c) => n + chapterWords(c), 0) / 160) });
const byId = new Map(BOOKS.map((b) => [b.bookId, b]));

export const list = () => BOOKS.map(card);

export function get(bookId) {
  const b = byId.get(bookId);
  if (!b) throw notFound("الكتاب غير موجود", "BOOK_NOT_FOUND");
  return { ...card(b), toc: b.chapters.map((c) => ({ chapterId: c.chapterId, order: c.order, title: c.title, minutes: Math.max(1, Math.round(chapterWords(c) / 160)) })) };
}

export function chapter(bookId, order) {
  const b = byId.get(bookId);
  const c = b?.chapters.find((x) => x.order === Number(order));
  if (!c) throw notFound("الفصل غير موجود", "CHAPTER_NOT_FOUND");
  return { ...c, bookId, bookTitle: b.title, color: b.cover?.color || null, total: b.chapters.length, minutes: Math.max(1, Math.round(chapterWords(c) / 160)) };
}

// الكتاب كاملاً للطباعة
export function full(bookId) {
  const b = byId.get(bookId);
  if (!b) throw notFound("الكتاب غير موجود", "BOOK_NOT_FOUND");
  return b;
}

export async function getProgress(userId) {
  const doc = await BookProgress.findOne({ user: userId }).lean();
  return { read: plainMap(doc?.read), last: plainMap(doc?.last) };
}

export async function setProgress(userId, bookId, { chapter: order, read } = {}) {
  const set = {};
  if (Number.isInteger(order)) set[`last.${bookId}`] = order;
  if (read && Number.isInteger(order)) set[`read.${bookId}:${order}`] = new Date();
  if (!Object.keys(set).length) return getProgress(userId);
  const doc = await BookProgress.findOneAndUpdate({ user: userId }, { $set: set }, { new: true, upsert: true, runValidators: true }).lean();
  return { read: plainMap(doc.read), last: plainMap(doc.last) };
}
