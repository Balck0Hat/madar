import { describe, it, expect, beforeEach } from "vitest";
import * as figures from "../figures.service.js";
import Figure from "../figure.model.js";

const mk = (over = {}) => ({
  figureId: "hammurabi", name: "حمورابي", englishName: "Hammurabi", tier: "1", born: "~-1810", died: "~-1750",
  era: "القديم", region: "بابل", category: "قادة وسياسة", why: "شريعة حمورابي", quick: "ملخص.",
  story: [{ h: "أ", p: "نصّ." }], published: true, order: 1, ...over,
});

beforeEach(async () => { await Figure.deleteMany({}); });

describe("figures.service", () => {
  it("should list published figures as cards without the story", async () => {
    await figures.seed([mk(), mk({ figureId: "cyrus", name: "كورش", englishName: "Cyrus", order: 2 })]);
    const out = await figures.list();
    expect(out.map((f) => f.figureId)).toEqual(["hammurabi", "cyrus"]);
    expect(out[0].story).toBeUndefined();
    expect(out[0]._id).toBeUndefined();
  });

  it("should hide unpublished figures", async () => {
    await figures.seed([mk(), mk({ figureId: "draft", published: false })]);
    expect((await figures.list()).map((f) => f.figureId)).toEqual(["hammurabi"]);
    await expect(figures.get("draft")).rejects.toMatchObject({ code: "FIGURE_NOT_FOUND" });
  });

  it("should filter by era and category, and search by either name", async () => {
    await figures.seed([mk(), mk({ figureId: "newton", name: "نيوتن", englishName: "Isaac Newton", era: "الحديث المبكر", category: "علوم وطب", why: "قوانين الحركة", order: 2 })]);
    expect((await figures.list({ era: "القديم" })).map((f) => f.figureId)).toEqual(["hammurabi"]);
    expect((await figures.list({ category: "علوم وطب" })).map((f) => f.figureId)).toEqual(["newton"]);
    expect((await figures.list({ q: "newt" })).map((f) => f.figureId)).toEqual(["newton"]);
    expect((await figures.list({ q: "حمور" })).map((f) => f.figureId)).toEqual(["hammurabi"]);
  });

  it("should treat search text as text, not as a pattern", async () => {
    await figures.seed([mk()]);
    expect(await figures.list({ q: ".*" })).toEqual([]);
  });

  it("should return the full story on get", async () => {
    await figures.seed([mk()]);
    const f = await figures.get("hammurabi");
    expect(f.story).toHaveLength(1);
    expect(f._id).toBeUndefined();
  });

  it("should replace on reseed rather than duplicate", async () => {
    await figures.seed([mk()]);
    await figures.seed([mk({ why: "نصّ جديد" })]);
    expect(await Figure.countDocuments()).toBe(1);
    expect((await figures.get("hammurabi")).why).toBe("نصّ جديد");
  });
});
