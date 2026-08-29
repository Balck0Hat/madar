import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import * as progress from "../progress.service.js";
import { applyFinish, streakFrom, dayKey } from "../../../shared/utils/game.js";

const userId = () => new mongoose.Types.ObjectId();

describe("progress.service getState", () => {
  it("should create an empty state for a new user", async () => {
    const st = await progress.getState(userId());
    expect(st).toMatchObject({ progress: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], streak: 0 });
  });
});

describe("progress.service finishUnit", () => {
  it("should award lesson + quiz + perfect XP and the first badge on a perfect first pass", async () => {
    const uid = userId();
    const { state, result } = await progress.finishUnit(uid, "center-1", { correct: 5, total: 5, sim: false });
    expect(result.passed).toBe(true);
    expect(result.gain).toBe(50 + 30 + 30);
    expect(result.newBadges).toContain("first");
    expect(state.xp).toBe(110);
    expect(state.streak).toBe(1);
    expect(state.studied).toEqual([dayKey()]);
    expect(state.progress["center-1"]).toMatchObject({ score: 5, total: 5, perfect: true });
  });

  it("should not award XP again when a passed unit is repeated", async () => {
    const uid = userId();
    await progress.finishUnit(uid, "center-1", { correct: 5, total: 5 });
    const { result, state } = await progress.finishUnit(uid, "center-1", { correct: 5, total: 5 });
    expect(result.gain).toBe(0);
    expect(result.fresh).toBe(false);
    expect(state.xp).toBe(110);
  });

  it("should fail below 70% and keep the unit unfinished but count the attempt", async () => {
    const uid = userId();
    const { result, state } = await progress.finishUnit(uid, "human-1-3", { correct: 6, total: 10 });
    expect(result.passed).toBe(false);
    expect(state.progress["human-1-3"]).toBeUndefined();
    expect(state.attempts["human-1-3"]).toBe(1);
    // النجاح لاحقاً بعلامة كاملة لا يُعدّ "من أول محاولة"
    const again = await progress.finishUnit(uid, "human-1-3", { correct: 10, total: 10 });
    expect(again.result.gain).toBe(80);
  });

  it("should use ring-2 XP for a ring-2 unit", async () => {
    const { result } = await progress.finishUnit(userId(), "earth-2-1", { correct: 8, total: 10 });
    expect(result.gain).toBe(100 + 60);
  });

  it("should complete a knowledge thread and pay the thread bonus", async () => {
    const uid = userId();
    await progress.finishUnit(uid, "human-1-3", { correct: 8, total: 10 });
    const { result } = await progress.finishUnit(uid, "tech-1-7", { correct: 8, total: 10 });
    expect(result.newThreads).toEqual(["human-1-3tech-1-7"]);
    expect(result.gain).toBe(80 + 150);
    expect(result.newBadges).toContain("thread");
  });

  it("should reject an invalid unit id", async () => {
    await expect(progress.finishUnit(userId(), "nope-9-9", { correct: 1, total: 1 })).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("game helpers", () => {
  it("streakFrom should count consecutive days ending today or yesterday", () => {
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return dayKey(x); };
    expect(streakFrom([])).toBe(0);
    expect(streakFrom([d(0)])).toBe(1);
    expect(streakFrom([d(1), d(2)])).toBe(2);
    expect(streakFrom([d(2), d(3)])).toBe(0);
  });

  it("applyFinish should be pure and not mutate the input state", () => {
    const state = { progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], streak: 0 };
    applyFinish(state, { unitId: "center-1", ring: 0, correct: 5, total: 5, sim: false });
    expect(state.xp).toBe(0);
    expect(state.progress).toEqual({});
  });
});
