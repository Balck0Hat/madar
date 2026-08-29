import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as analytics from "../analytics.service.js";
import UnitEvent from "../unitEvent.model.js";
import * as content from "../../content/content.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

const uid = () => new mongoose.Types.ObjectId();
// createdAt غير قابل للتعديل عبر mongoose، فنُزيّف الزمن من السائق مباشرة
const ageEvents = (ms) => UnitEvent.collection.updateMany({}, { $set: { createdAt: new Date(Date.now() - ms) } });

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

describe("analytics.record", () => {
  it("should ignore a repeated page event for the same user, unit and page within a minute", async () => {
    const user = uid();
    expect(await analytics.record(user, { unitId: "center-1", kind: "page", page: 3 })).toEqual({ recorded: true });
    expect(await analytics.record(user, { unitId: "center-1", kind: "page", page: 3 })).toMatchObject({ recorded: false, reason: "duplicate" });
    expect(await UnitEvent.countDocuments({ user, page: 3 })).toBe(1);
  });

  it("should record another page, another unit and another user separately", async () => {
    const user = uid();
    await analytics.record(user, { unitId: "center-1", kind: "page", page: 3 });
    await analytics.record(user, { unitId: "center-1", kind: "page", page: 4 });
    await analytics.record(user, { unitId: "center-2", kind: "page", page: 3 });
    await analytics.record(uid(), { unitId: "center-1", kind: "page", page: 3 });
    expect(await UnitEvent.countDocuments()).toBe(4);
  });

  it("should record the page again once the suppression window has passed", async () => {
    const user = uid();
    await analytics.record(user, { unitId: "center-1", kind: "page", page: 3 });
    await ageEvents(analytics.DEDUPE_MS + 5000);
    expect(await analytics.record(user, { unitId: "center-1", kind: "page", page: 3 })).toEqual({ recorded: true });
    expect(await UnitEvent.countDocuments({ user })).toBe(2);
  });

  it("should never suppress opens, quiz starts or finishes", async () => {
    const user = uid();
    for (const kind of ["open", "open", "quiz_start", "quiz_start", "finish"]) await analytics.record(user, { unitId: "center-1", kind });
    expect(await UnitEvent.countDocuments({ user })).toBe(5);
    expect(await UnitEvent.countDocuments({ user, page: { $ne: 0 } })).toBe(0);
  });
});

describe("analytics.funnel", () => {
  it("should build a per-unit funnel with titles and a drop-off page", async () => {
    const [a, b, c] = [uid(), uid(), uid()];
    for (const u of [a, b, c]) {
      await analytics.record(u, { unitId: "center-1", kind: "open" });
      await analytics.record(u, { unitId: "center-1", kind: "page", page: 2 });
    }
    // متعلم واحد فقط أكمل؛ اثنان توقّفا عند البطاقة الثانية
    await analytics.record(a, { unitId: "center-1", kind: "page", page: 5 });
    await analytics.record(a, { unitId: "center-1", kind: "quiz_start" });
    await analytics.record(a, { unitId: "center-1", kind: "finish" });

    const { units } = await analytics.funnel();
    expect(units).toHaveLength(1);
    expect(units[0]).toMatchObject({ unitId: "center-1", opens: 3, quizStarts: 1, finishes: 1, completion: 33, dropOffPage: 2, dropOffShare: 67 });
    expect(units[0].title).toBeTruthy();
    expect(units[0].title).not.toBe("center-1");
  });

  it("should list the worst completion rate first", async () => {
    await analytics.record(uid(), { unitId: "center-1", kind: "open" });
    const done = uid();
    await analytics.record(done, { unitId: "center-2", kind: "open" });
    await analytics.record(done, { unitId: "center-2", kind: "finish" });
    const { units } = await analytics.funnel();
    expect(units.map((u) => u.unitId)).toEqual(["center-1", "center-2"]);
  });

  it("should return an empty list when nothing has been tracked", async () => {
    expect(await analytics.funnel()).toMatchObject({ units: [], days: 90 });
  });
});

describe("analytics.hardQuestions", () => {
  it("should drop small samples, rank by wrong-rate and group per unit", async () => {
    await content.recordQuestionResults("center-1", Array.from({ length: 8 }, () => ({ qid: "q1", ok: false })));
    await content.recordQuestionResults("center-1", Array.from({ length: 8 }, () => ({ qid: "q2", ok: true })));
    await content.recordQuestionResults("center-1", Array.from({ length: 4 }, () => ({ qid: "q2", ok: false })));
    // ضجيج: عُرض مرتين وأُخطئ مرتين — 100% لكنه لا يعني شيئاً
    await content.recordQuestionResults("center-2", [{ qid: "q1", ok: false }, { qid: "q1", ok: false }]);

    const { units, minAsked } = await analytics.hardQuestions();
    expect(minAsked).toBe(5);
    expect(units.map((u) => u.unitId)).toEqual(["center-1"]);
    expect(units[0].questions.map((q) => q.qid)).toEqual(["q1", "q2"]);
    expect(units[0].questions[0]).toMatchObject({ asked: 8, wrong: 8, rate: 100 });
    expect(units[0].questions[0].q).toBeTruthy();
    expect(units[0].avgRate).toBe(67);
  });

  it("should include the noisy question once the minimum sample is lowered", async () => {
    await content.recordQuestionResults("center-2", [{ qid: "q1", ok: false }, { qid: "q1", ok: false }]);
    const { units } = await analytics.hardQuestions({ min: 2 });
    expect(units).toHaveLength(1);
    expect(units[0].questions[0]).toMatchObject({ qid: "q1", rate: 100 });
  });
});
