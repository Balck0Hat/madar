import { describe, it, expect } from "vitest";
import { checkImportUnit, importUnits } from "../import.service.js";
import * as content from "../../content/content.service.js";
import { validUnit, withQuestion } from "./unit.fixture.js";

const errorsOf = (unit) => checkImportUnit(unit).errors.join(" | ");

describe("import validation — accepting", () => {
  it("should accept a complete unit", () => {
    const report = checkImportUnit(validUnit());
    expect(report).toMatchObject({ unitId: "earth-1-1", ok: true, errors: [] });
    expect(report.body.unitId).toBeUndefined();
  });

  it("should accept a unit exported straight from the database (mongo fields ignored)", () => {
    const raw = { ...validUnit(), _id: "65f0000000000000000000aa", __v: 0, createdAt: new Date(), updatedAt: new Date(), updatedBy: null };
    expect(checkImportUnit(raw).ok).toBe(true);
  });
});

describe("import validation — rejecting", () => {
  it("should reject a unit with no identifier", () => {
    expect(checkImportUnit({ title: "بلا معرّف" })).toMatchObject({ ok: false, unitId: null });
    expect(checkImportUnit(null).ok).toBe(false);
    expect(checkImportUnit([]).ok).toBe(false);
  });

  it("should reject an identifier that is not on the tree", () => {
    expect(errorsOf(validUnit("earth-9-9"))).toContain("معرّف وحدة غير صالح");
  });

  it("should reject an mcq answer index outside its options", () => {
    expect(errorsOf(withQuestion("q1", { a: 9 }))).toContain("مؤشر إجابة صحيح");
  });

  it("should reject an order answer that is not a real permutation", () => {
    expect(errorsOf(withQuestion("q23", { a: [0, 0, 1] }))).toContain("ليس تبديلاً صحيحاً");
    expect(errorsOf(withQuestion("q23", { a: [1, 2, 3] }))).toContain("ليس تبديلاً صحيحاً");
  });

  it("should reject an open question without keywords", () => {
    expect(errorsOf(withQuestion("q24", { keywords: ["واحدة"] }))).toContain("3 كلمات مفتاحية");
  });

  it("should reject a thread pointing at the same domain", () => {
    const u = validUnit();
    u.thread = { ...u.thread, to: "earth-1-3" };
    expect(errorsOf(u)).toContain("المجال نفسه");
  });

  it("should reject a missing thread and a thread answer out of range", () => {
    expect(errorsOf(validUnit("earth-1-1", { thread: undefined }))).toContain("لا خيط");
    const u = validUnit();
    u.thread = { ...u.thread, a: 7 };
    expect(errorsOf(u)).toContain("thread.a خارج الخيارات");
  });

  it("should reject too few cards or questions for the ring", () => {
    const thin = validUnit("earth-1-1", { cards: validUnit().cards.slice(0, 3) });
    expect(errorsOf(thin)).toContain("البطاقات 3 < 7");
    const few = validUnit("earth-1-1", { questions: validUnit().questions.slice(0, 12) });
    expect(errorsOf(few)).toContain("الأسئلة 12 < 24");
  });

  it("should apply the harder limits of the second ring", () => {
    expect(errorsOf(validUnit("earth-2-1"))).toContain("< 11");
  });

  it("should reject duplicated question ids and duplicated options", () => {
    const u = validUnit();
    u.questions = [...u.questions, { ...u.questions[0], q: "سؤال مكرر المعرّف؟" }];
    expect(errorsOf(u)).toContain("qid مكرر q1");
    expect(errorsOf(withQuestion("q2", { opts: ["نفسه", "نفسه", "ثالث", "رابع"] }))).toContain("خيارات مكررة");
  });

  it("should reject a short summary, few goals and unknown extra keys", () => {
    expect(errorsOf(validUnit("earth-1-1", { summary: ["واحدة"] }))).toContain("الخلاصة أقل من 3");
    expect(errorsOf(validUnit("earth-1-1", { goals: ["هدف"] }))).toContain("الأهداف أقل من 3");
    expect(errorsOf({ ...validUnit(), hackField: 1 })).toMatch(/hackField|Unrecognized/);
  });
});

describe("importUnits", () => {
  it("should import nothing when any unit fails and no force is given", async () => {
    const res = await importUnits([validUnit("earth-1-1"), validUnit("earth-1-2", { goals: [] })], {}, null);
    expect(res).toMatchObject({ applied: false, imported: 0, failed: 1 });
    expect(res.reports.map((r) => r.ok)).toEqual([true, false]);
    expect(await content.listPublishedIds()).toHaveLength(0);
  });

  it("should import the valid ones and report the rest when forced", async () => {
    const res = await importUnits([validUnit("earth-1-1"), validUnit("earth-1-2", { goals: [] })], { force: true }, null);
    expect(res).toMatchObject({ applied: true, imported: 1, failed: 1 });
    expect(await content.listPublishedIds()).toEqual(["earth-1-1"]);
    expect(res.reports[1].errors.length).toBeGreaterThan(0);
  });

  it("should import everything when all units are valid, and snapshot units it overwrites", async () => {
    const first = await importUnits([validUnit("earth-1-1"), validUnit("earth-1-2")], {}, null);
    expect(first).toMatchObject({ applied: true, imported: 2, failed: 0 });
    expect(await content.listVersions("earth-1-1")).toHaveLength(0);
    await importUnits([validUnit("earth-1-1", { title: "عنوان مستورد جديد" })], {}, null);
    const versions = await content.listVersions("earth-1-1");
    expect(versions).toHaveLength(1);
    expect(versions[0].note).toBe("استيراد JSON");
  });

  it("should report without writing anything on a dry run", async () => {
    const res = await importUnits([validUnit("earth-1-1")], { dryRun: true }, null);
    expect(res).toMatchObject({ applied: false, dryRun: true, imported: 0, failed: 0 });
    expect(res.reports[0].ok).toBe(true);
    expect(await content.listPublishedIds()).toHaveLength(0);
  });

  it("should never leak the report payload back to the caller", async () => {
    const res = await importUnits([validUnit()], {}, null);
    expect(Object.keys(res.reports[0]).sort()).toEqual(["errors", "ok", "unitId"]);
  });
});
