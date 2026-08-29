import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as reviews from "../reviews.service.js";
import Review from "../review.model.js";
import { weakFactor, daysFor, addWrong, dropWrong, pickReview, MAX_WRONG_QIDS, INTERVALS } from "../reviews.adaptive.js";
import * as content from "../../content/content.service.js";
import * as progress from "../../progress/progress.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

const uid = () => new mongoose.Types.ObjectId();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hours = (n) => Date.now() + n * 3600e3;

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

describe("reviews.adaptive (pure)", () => {
  it("should keep the original intervals for strong performance", () => {
    expect(weakFactor(1)).toBe(1);
    expect(weakFactor(0.9)).toBe(1);
    expect(weakFactor(null)).toBe(1);
    expect(daysFor(3, 1)).toBe(INTERVALS[3]);
  });

  it("should shorten the interval as the score drops, never below a third", () => {
    expect(weakFactor(0.7)).toBeCloseTo(0.7 / 0.9, 5);
    expect(weakFactor(0)).toBeCloseTo(1 / 3, 5);
    expect(daysFor(4, 0)).toBeCloseTo(INTERVALS[4] / 3, 5);
    expect(daysFor(0, 0.7)).toBeLessThan(1);
  });

  it("should keep the newest wrong qid first and cap the list", () => {
    let list = [];
    for (let i = 1; i <= MAX_WRONG_QIDS + 3; i++) list = addWrong(list, `q${i}`);
    expect(list).toHaveLength(MAX_WRONG_QIDS);
    expect(list[0]).toBe(`q${MAX_WRONG_QIDS + 3}`);
    expect(addWrong(["a", "b"], "b")).toEqual(["b", "a"]);
    expect(dropWrong(["a", "b"], "b")).toEqual(["a"]);
  });

  it("should pick the wrong questions first and fill the rest from the bank", () => {
    const bank = ["q1", "q2", "q3", "q4"].map((qid) => ({ qid }));
    expect(pickReview(bank, ["q4", "q2"], 2).map((q) => q.qid).sort()).toEqual(["q2", "q4"]);
    const filled = pickReview(bank, ["q3"], 2).map((q) => q.qid);
    expect(filled[0]).toBe("q3");
    expect(filled).toHaveLength(2);
    expect(pickReview(bank, [], 2)).toHaveLength(2);
  });
});

describe("reviews adaptive scheduling", () => {
  it("should schedule a weakly passed unit sooner than a strong one", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1", { score: 1 });
    await reviews.schedule(user, "center-2", { score: 0.7 });
    const strong = await Review.findOne({ user, unitId: "center-1" }).lean();
    const weak = await Review.findOne({ user, unitId: "center-2" }).lean();
    expect(strong.due.getTime()).toBeGreaterThan(hours(23));
    expect(weak.due.getTime()).toBeLessThan(hours(20));
    expect(weak.due.getTime()).toBeLessThan(strong.due.getTime());
  });

  it("should derive the score from the finished quiz when a unit is passed", async () => {
    const user = uid();
    await progress.finishUnit(user, "center-1", { correct: 10, total: 10, sim: false });
    await progress.finishUnit(user, "center-2", { correct: 7, total: 10, sim: false });
    await wait(250);
    const strong = await Review.findOne({ user, unitId: "center-1" }).lean();
    const weak = await Review.findOne({ user, unitId: "center-2" }).lean();
    expect(strong.due.getTime()).toBeGreaterThan(hours(23));
    expect(weak.due.getTime()).toBeLessThan(hours(20));
  });

  it("should record a wrong review answer as a weak qid and bring the unit back within hours", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1");
    const out = await reviews.answer(user, "center-1", false, "q3");
    expect(out.stage).toBe(0);
    const doc = await Review.findOne({ user, unitId: "center-1" }).lean();
    expect(doc.wrongQids).toEqual(["q3"]);
    expect(doc.due.getTime()).toBeLessThan(hours(12));
  });

  it("should forget a weak qid once it is answered correctly", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1");
    await reviews.answer(user, "center-1", false, "q3");
    await reviews.answer(user, "center-1", true, "q3");
    const doc = await Review.findOne({ user, unitId: "center-1" }).lean();
    expect(doc.wrongQids).toEqual([]);
    // إجابة صحيحة تعود للفاصل الكامل للمرحلة الأولى بلا تقريب
    expect(doc.due.getTime()).toBeGreaterThan(hours(INTERVALS[1] * 24 - 1));
  });

  it("should draw the review questions from the qids the learner actually got wrong", async () => {
    const user = uid();
    const unitId = "human-1-3";
    // أسئلة الامتحان المحجوزة لا تصل المتعلم أصلاً، فلا يمكن أن تكون بين أخطائه
    const closed = (await content.questionBank(unitId)).filter((q) => q.examOnly !== true && (q.t === "mcq" || q.t === "tf"));
    const weak = [closed[closed.length - 1].qid, closed[closed.length - 2].qid];
    await reviews.schedule(user, unitId);
    await Review.updateOne({ user, unitId }, { $set: { due: new Date(Date.now() - 1000), wrongQids: weak } });
    const { items } = await reviews.dueList(user);
    expect(items[0].questions.map((q) => q.qid).sort()).toEqual([...weak].sort());
  });

  it("should pull a scheduled unit forward when it is passed weakly again", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1", { score: 1 });
    await reviews.schedule(user, "center-1", { score: 0.7 });
    const doc = await Review.findOne({ user, unitId: "center-1" }).lean();
    expect(doc.due.getTime()).toBeLessThan(hours(20));
  });
});
