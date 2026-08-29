import { describe, it, expect } from "vitest";
import * as content from "../content.service.js";
import UnitVersion from "../unitVersion.model.js";
import Unit from "../unit.model.js";
import { MAX_VERSIONS } from "../version.service.js";

const ID = "earth-2-1";
const body = (over = {}) => ({
  title: "الأرض تتحرك",
  goals: ["هدف"],
  cards: [{ h: "بطاقة", p: "نص البطاقة" }],
  summary: ["نقطة"],
  questions: [{ qid: "q1", t: "tf", q: "الأرض تدور؟", a: true, why: "نعم" }],
  published: false,
  ...over,
});

describe("unit versions — snapshot", () => {
  it("should not snapshot when the unit is created for the first time", async () => {
    await content.upsertUnit(ID, body(), null);
    expect(await UnitVersion.countDocuments({ unitId: ID })).toBe(0);
  });

  it("should snapshot the previous state on every later save", async () => {
    await content.upsertUnit(ID, body({ title: "الأولى" }), null);
    await content.upsertUnit(ID, body({ title: "الثانية" }), null, "تعديل");
    await content.upsertUnit(ID, body({ title: "الثالثة" }), null);
    const versions = await content.listVersions(ID);
    expect(versions.map((v) => v.version)).toEqual([2, 1]);
    // النسخة 1 تحمل الحالة قبل الحفظ الثاني، أي العنوان الأول
    const v1 = await content.getVersion(ID, 1);
    expect(v1.unit.title).toBe("الأولى");
    expect((await content.getVersion(ID, 2)).unit.title).toBe("الثانية");
    expect(versions.find((v) => v.version === 1).note).toBe("تعديل");
  });

  it("should store card and question counts and hide the payload from the list", async () => {
    await content.upsertUnit(ID, body(), null);
    await content.upsertUnit(ID, body({ cards: [], questions: [] }), null);
    const [first] = await content.listVersions(ID);
    expect(first).toMatchObject({ version: 1, cards: 1, questions: 1 });
    expect(first.snapshot).toBeUndefined();
  });

  it("should strip mongo internals from the snapshot", async () => {
    await content.upsertUnit(ID, body(), null);
    await content.upsertUnit(ID, body({ title: "جديد" }), null);
    const { unit } = await content.getVersion(ID, 1);
    for (const key of ["_id", "__v", "createdAt", "updatedAt", "updatedBy"]) expect(unit[key]).toBeUndefined();
    expect(unit.unitId).toBe(ID);
  });

  it("should 404 on an unknown version", async () => {
    await content.upsertUnit(ID, body(), null);
    await expect(content.getVersion(ID, 9)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("unit versions — prune", () => {
  it(`should keep only the newest ${MAX_VERSIONS} versions`, async () => {
    await content.upsertUnit(ID, body({ title: "ن0" }), null);
    for (let i = 1; i <= MAX_VERSIONS + 3; i++) await content.upsertUnit(ID, body({ title: `ن${i}` }), null);
    const versions = await content.listVersions(ID);
    expect(versions).toHaveLength(MAX_VERSIONS);
    expect(versions[0].version).toBe(MAX_VERSIONS + 3);
    expect(versions.at(-1).version).toBe(4);
    await expect(content.getVersion(ID, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("unit versions — restore", () => {
  it("should restore a snapshot as the current unit and snapshot the current state first", async () => {
    await content.upsertUnit(ID, body({ title: "الأصل" }), null);
    await content.upsertUnit(ID, body({ title: "المُتلَف", cards: [], questions: [] }), null);
    const restored = await content.restoreVersion(ID, 1, null);
    expect(restored.title).toBe("الأصل");
    expect(restored.questions).toHaveLength(1);
    expect(restored.cards).toHaveLength(1);
    // النسخة 2 أُنشئت من حالة «المُتلَف» قبل الاستعادة فالتراجع ممكن
    const versions = await content.listVersions(ID);
    expect(versions[0].version).toBe(2);
    expect(versions[0].note).toContain("استعادة");
    expect((await content.getVersion(ID, 2)).unit.title).toBe("المُتلَف");
  });

  it("should drop optional fields that the snapshot did not have", async () => {
    await content.upsertUnit(ID, body({ spark: "بلا خيط" }), null);
    await content.upsertUnit(ID, body({ spark: "بلا خيط", thread: { to: "life-1-5", text: "ن", q: "س؟", opts: ["أ", "ب"], a: 0, why: "لأن" } }), null);
    expect((await Unit.findOne({ unitId: ID }).lean()).thread.to).toBe("life-1-5");
    const restored = await content.restoreVersion(ID, 1, null);
    expect(restored.thread).toBeUndefined();
    expect(restored.spark).toBe("بلا خيط");
  });

  it("should 404 when restoring a version that does not exist", async () => {
    await content.upsertUnit(ID, body(), null);
    await expect(content.restoreVersion(ID, 7, null)).rejects.toMatchObject({ statusCode: 404 });
  });
});
