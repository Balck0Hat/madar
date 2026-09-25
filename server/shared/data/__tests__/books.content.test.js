import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BOOKS } from "../books/index.js";

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const total = (c) => words(c.hook) + (c.sections || []).reduce((n, s) => n + words(s.p), 0) + (c.exercise?.steps || []).reduce((n, s) => n + words(s), 0) + (c.takeaways || []).reduce((n, s) => n + words(s), 0);

describe("books content", () => {
  it("should ship three books with ten chapters each and a complete schema", () => {
    expect(BOOKS.map((b) => b.bookId)).toEqual(["do-everything", "hyper-productive", "one-place"]);
    const bad = [];
    for (const b of BOOKS) {
      for (const k of ["title", "subtitle", "tagline", "audience", "promise", "intro"]) if (!b[k]) bad.push(`${b.bookId}: ${k}`);
      if (!b.cover?.color || !b.cover?.glyph) bad.push(`${b.bookId}: cover`);
      if (!(b.sources?.length >= 4)) bad.push(`${b.bookId}: sources`);
      if (b.chapters.length !== 10) bad.push(`${b.bookId}: ${b.chapters.length} فصول`);
      b.chapters.forEach((c, i) => {
        if (c.order !== i + 1) bad.push(`${b.bookId}/${c.chapterId}: order`);
        for (const k of ["chapterId", "title", "hook"]) if (!c[k]) bad.push(`${b.bookId}/${c.chapterId}: ${k}`);
        if (!(c.sections?.length >= 4 && c.sections.length <= 6)) bad.push(`${b.bookId}/${c.chapterId}: ${c.sections?.length} أقسام`);
        if (!(c.exercise?.steps?.length >= 2)) bad.push(`${b.bookId}/${c.chapterId}: تمرين`);
        if (!(c.takeaways?.length === 3)) bad.push(`${b.bookId}/${c.chapterId}: خلاصات`);
        if (!(c.check?.opts?.length >= 2 && c.check.opts[c.check.a] !== undefined)) bad.push(`${b.bookId}/${c.chapterId}: سؤال`);
        const n = total(c);
        if (n < 900 || n > 1700) bad.push(`${b.bookId}/${c.chapterId}: ${n} كلمة`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("should keep every book file within 150 lines", () => {
    const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "books");
    const long = [];
    for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const f of fs.readdirSync(path.join(root, dir.name))) {
        const n = fs.readFileSync(path.join(root, dir.name, f), "utf8").split("\n").length;
        if (n > 150) long.push(`${dir.name}/${f}: ${n}`);
      }
    }
    expect(long).toEqual([]);
  });
});
