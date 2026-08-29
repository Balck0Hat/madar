import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as reviews from "../reviews.service.js";
import Review from "../review.model.js";
import * as content from "../../content/content.service.js";
import * as progress from "../../progress/progress.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

const uid = () => new mongoose.Types.ObjectId();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

describe("reviews.service", () => {
  it("should schedule a review for tomorrow when a unit is passed", async () => {
    const user = uid();
    await progress.finishUnit(user, "center-1", { correct: 5, total: 5, sim: false });
    await wait(50);
    const r = await Review.findOne({ user, unitId: "center-1" }).lean();
    expect(r).toBeTruthy();
    expect(r.stage).toBe(0);
    expect(r.due.getTime()).toBeGreaterThan(Date.now() + 20 * 3600e3);
  });

  it("should list due reviews with two closed questions each", async () => {
    const user = uid();
    await reviews.schedule(user, "human-1-3");
    await Review.updateOne({ user, unitId: "human-1-3" }, { $set: { due: new Date(Date.now() - 1000) } });
    const { items, totalDue } = await reviews.dueList(user);
    expect(totalDue).toBe(1);
    expect(items[0].questions).toHaveLength(2);
    expect(items[0].questions.every((q) => q.t === "mcq" || q.t === "tf")).toBe(true);
  });

  it("should advance the stage on a correct answer and grant XP", async () => {
    const user = uid();
    await progress.getState(user);
    await reviews.schedule(user, "center-1");
    const out = await reviews.answer(user, "center-1", true);
    expect(out.stage).toBe(1);
    expect(out.gain).toBe(reviews.XP_REVIEW);
    await wait(80);
    expect((await progress.getState(user)).xp).toBe(reviews.XP_REVIEW);
  });

  it("should reset the stage on a wrong answer", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1");
    await Review.updateOne({ user, unitId: "center-1" }, { $set: { stage: 3 } });
    const out = await reviews.answer(user, "center-1", false);
    expect(out.stage).toBe(0);
    expect(out.gain).toBe(0);
  });

  it("should 404 when answering a unit with no review", async () => {
    await expect(reviews.answer(uid(), "center-1", true)).rejects.toMatchObject({ statusCode: 404 });
  });
});
