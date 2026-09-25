import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as books from "../books.service.js";
import BookProgress from "../bookProgress.model.js";

beforeEach(async () => { await BookProgress.deleteMany({}); });

describe("books.service", () => {
  it("should list books as cards, serve a book with its contents, and a chapter with its position", () => {
    const list = books.list();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].toc).toBeUndefined();
    expect(typeof list[0].chapters).toBe("number");
    const b = books.get(list[0].bookId);
    expect(b.toc.length).toBe(b.chapters);
    const c = books.chapter(b.bookId, 1);
    expect(c).toMatchObject({ order: 1, bookId: b.bookId, total: b.chapters });
    expect(c.sections.length).toBeGreaterThan(0);
    expect(() => books.get("nope")).toThrowError(expect.objectContaining({ code: "BOOK_NOT_FOUND" }));
    expect(() => books.chapter(b.bookId, 99)).toThrowError(expect.objectContaining({ code: "CHAPTER_NOT_FOUND" }));
  });

  it("should keep per-user progress: last chapter and read marks", async () => {
    const u = new mongoose.Types.ObjectId();
    expect(await books.getProgress(u)).toEqual({ read: {}, last: {} });
    expect(await books.setProgress(u, "do-everything", { chapter: 3 })).toMatchObject({ last: { "do-everything": 3 }, read: {} });
    const p = await books.setProgress(u, "do-everything", { chapter: 3, read: true });
    expect(p.read["do-everything:3"]).toBeInstanceOf(Date);
    expect(await books.setProgress(u, "do-everything", {})).toMatchObject({ last: { "do-everything": 3 } });
  });
});
