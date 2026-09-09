import { describe, it, expect } from "vitest";
import { applyFinish, stats } from "../game.js";
import { XP_LESSON, XP_QUIZ } from "../../data/curriculum.js";

const base = () => ({ progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], streak: 0, freezes: 0, frozenDays: [] });
const RING = 0;

// كان الاختبار شرط الإتمام: من قرأ الوحدة كلّها ولم يُمتحن لم يُحتسب له شيء.
// الأسئلة اختياريّة الآن، بين البطاقات وفي آخر الوحدة.
describe("finishing a unit by reading", () => {
  it("should complete the unit and grant lesson XP without a quiz", () => {
    const { next, result } = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true });
    expect(result.passed).toBe(true);
    expect(next.progress["human-1-1"]).toMatchObject({ read: true, total: 0 });
    expect(result.gain).toBe(XP_LESSON[RING]);
    expect(stats(next.progress).units).toBe(1);
  });

  it("should not pay twice for reading the same unit again", () => {
    const once = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true }).next;
    const { result } = applyFinish(once, { unitId: "human-1-1", ring: RING, read: true });
    expect(result.gain).toBe(0);
  });

  it("should not count reading as a quiz attempt", () => {
    const { next } = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true });
    expect(next.attempts["human-1-1"]).toBeUndefined();
  });

  it("should mark the day as studied and start the streak", () => {
    const { next } = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true });
    expect(next.studied).toHaveLength(1);
    expect(next.streak).toBe(1);
  });
});

describe("the optional quiz on top of reading", () => {
  it("should add quiz XP when passed after reading, without paying the lesson again", () => {
    const read = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true }).next;
    const { next, result } = applyFinish(read, { unitId: "human-1-1", ring: RING, correct: 9, total: 10 });
    expect(result.gain).toBe(XP_QUIZ[RING]);
    expect(next.progress["human-1-1"]).toMatchObject({ read: true, score: 9, total: 10 });
  });

  it("should still count a perfect first attempt after reading", () => {
    const read = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true }).next;
    const { next, result } = applyFinish(read, { unitId: "human-1-1", ring: RING, correct: 10, total: 10 });
    expect(next.progress["human-1-1"].perfect).toBe(true);
    expect(result.gain).toBe(XP_QUIZ[RING] * 2);
  });

  it("should pay lesson and quiz together for someone who skipped straight to the quiz", () => {
    const { result } = applyFinish(base(), { unitId: "human-1-1", ring: RING, correct: 9, total: 10 });
    expect(result.gain).toBe(XP_LESSON[RING] + XP_QUIZ[RING]);
  });

  it("should change nothing on a failed optional quiz", () => {
    const read = applyFinish(base(), { unitId: "human-1-1", ring: RING, read: true }).next;
    const { next, result } = applyFinish(read, { unitId: "human-1-1", ring: RING, correct: 3, total: 10 });
    expect(result.passed).toBe(false);
    expect(result.gain).toBe(0);
    expect(next.progress["human-1-1"]).toMatchObject({ read: true, total: 0 });
  });

  it("should not pay quiz XP a second time", () => {
    const passed = applyFinish(base(), { unitId: "human-1-1", ring: RING, correct: 9, total: 10 }).next;
    const { result } = applyFinish(passed, { unitId: "human-1-1", ring: RING, correct: 10, total: 10 });
    expect(result.gain).toBe(0);
  });
});
