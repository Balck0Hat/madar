import { get, put } from "../../../shared/utils/api";

export const listBooks = () => get("/books").then((d) => d.books);
export const getBook = (bookId) => get(`/books/${encodeURIComponent(bookId)}`).then((d) => d.book);
export const getChapter = (bookId, n) => get(`/books/${encodeURIComponent(bookId)}/chapters/${n}`).then((d) => d.chapter);
export const getFullBook = (bookId) => get(`/books/${encodeURIComponent(bookId)}/full`).then((d) => d.book);

// تقدّم القراءة على الحساب: { read: { "book:n": تاريخ }, last: { book: n } }
export const getProgress = () => get("/books/progress").then((d) => d.progress);
export const putProgress = (bookId, patch) => put(`/books/progress/${encodeURIComponent(bookId)}`, patch).then((d) => d.progress);

export const chapterKey = (bookId, n) => `${bookId}:${n}`;
