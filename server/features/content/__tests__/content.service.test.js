import { describe, it, expect, beforeEach } from "vitest";
import * as content from "../content.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

// معرّف يُضبط داخل الاختبار نفسه، فلا يتأثر بما يُضاف لاحقاً إلى ملفات الزرع
const DRAFT = "earth-3-8";

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

describe("content.service", () => {
  it("should list published unit ids after seeding", async () => {
    const ids = await content.listPublishedIds();
    expect(ids).toEqual(expect.arrayContaining(["center-1", "human-1-3"]));
    expect(ids.length).toBe(SEED_UNITS.length);
  });

  it("should return a public unit without keywords", async () => {
    const unit = await content.getPublishedUnit("center-1");
    expect(unit.title).toContain("دماغك");
    expect(unit.questions.every((q) => q.keywords === undefined)).toBe(true);
  });

  it("should 404 on an unpublished or unknown unit", async () => {
    // نُجبر الحالة بدل الاعتماد على غياب الوحدة من ملفات الزرع (تتغيّر مع نمو المحتوى)
    await content.upsertUnit(DRAFT, { title: "مسودة", published: false }, null);
    await expect(content.getPublishedUnit(DRAFT)).rejects.toMatchObject({ statusCode: 404 });
    await content.deleteUnit(DRAFT);
    await expect(content.getPublishedUnit(DRAFT)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should pick n random questions for the quiz", async () => {
    const quiz = await content.pickQuiz("human-1-3", 4);
    expect(quiz.questions).toHaveLength(4);
    expect(new Set(quiz.questions.map((q) => q.qid)).size).toBe(4);
  });

  it("should return summaries only for published units", async () => {
    await content.upsertUnit(DRAFT, { title: "مسودة", published: false }, null);
    const s = await content.summaries(["center-1", DRAFT]);
    expect(s).toHaveLength(1);
    expect(s[0].summary.length).toBeGreaterThan(0);
  });

  it("should upsert, unpublish and delete a unit via admin helpers", async () => {
    await content.upsertUnit("earth-2-1", { title: "الأرض تتحرك", questions: [], published: false }, null);
    expect(await content.listPublishedIds()).not.toContain("earth-2-1");
    await content.upsertUnit("earth-2-1", { title: "الأرض تتحرك", questions: [], published: true }, null);
    expect(await content.listPublishedIds()).toContain("earth-2-1");
    await content.deleteUnit("earth-2-1");
    await expect(content.deleteUnit("earth-2-1")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should record question stats as upserts", async () => {
    await content.recordQuestionResults("center-1", [{ qid: "q1", ok: false }, { qid: "q2", ok: true }]);
    await content.recordQuestionResults("center-1", [{ qid: "q1", ok: false }]);
    const QS = (await import("../questionStat.model.js")).default;
    const q1 = await QS.findOne({ unitId: "center-1", qid: "q1" }).lean();
    expect(q1).toMatchObject({ asked: 2, wrong: 2 });
  });
});
