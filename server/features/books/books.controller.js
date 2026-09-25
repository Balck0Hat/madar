import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as books from "./books.service.js";

export const list = asyncHandler(async (req, res) => { res.json({ success: true, data: { books: books.list() } }); });
export const get = asyncHandler(async (req, res) => { res.json({ success: true, data: { book: books.get(req.params.bookId) } }); });
export const chapter = asyncHandler(async (req, res) => { res.json({ success: true, data: { chapter: books.chapter(req.params.bookId, req.params.n) } }); });
export const full = asyncHandler(async (req, res) => { res.json({ success: true, data: { book: books.full(req.params.bookId) } }); });
export const getProgress = asyncHandler(async (req, res) => { res.json({ success: true, data: { progress: await books.getProgress(req.user.id) } }); });
export const setProgress = asyncHandler(async (req, res) => { res.json({ success: true, data: { progress: await books.setProgress(req.user.id, req.params.bookId, req.body) } }); });
