import { describe, it, expect } from "vitest";
import { applyFreeze, applyFinish, streakFrom, dayKey, daysAgoKey, MAX_FREEZES } from "../game.js";

const base = (over = {}) => ({ progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], frozenDays: [], freezes: 0, streak: 0, ...over });

describe("streak freeze", () => {
  it("should consume a freeze to bridge a missed yesterday", () => {
    const st = base({ studied: [daysAgoKey(2), daysAgoKey(3)], freezes: 1 });
    const out = applyFreeze(st);
    expect(out.freezes).toBe(0);
    expect(out.frozenDays).toEqual([daysAgoKey(1)]);
    expect(out.streak).toBe(3);
  });

  it("should not consume a freeze when today or yesterday was studied", () => {
    expect(applyFreeze(base({ studied: [dayKey()], freezes: 1 })).freezes).toBe(1);
    expect(applyFreeze(base({ studied: [daysAgoKey(1)], freezes: 1 })).freezes).toBe(1);
  });

  it("should not consume a freeze when the streak was already broken", () => {
    const out = applyFreeze(base({ studied: [daysAgoKey(3)], freezes: 1 }));
    expect(out.freezes).toBe(1);
    expect(out.frozenDays).toEqual([]);
  });

  it("streakFrom should count frozen days as part of the streak", () => {
    expect(streakFrom([daysAgoKey(2), dayKey()], [daysAgoKey(1)])).toBe(3);
  });

  it("should earn a freeze on every 7th consecutive day, capped", () => {
    const six = Array.from({ length: 6 }).map((_, i) => daysAgoKey(i + 1));
    const { next, result } = applyFinish(base({ studied: six }), { unitId: "center-1", ring: 0, correct: 5, total: 5, sim: false });
    expect(next.streak).toBe(7);
    expect(next.freezes).toBe(1);
    expect(result.earnedFreeze).toBe(true);
    const capped = applyFinish(base({ studied: six, freezes: MAX_FREEZES }), { unitId: "center-1", ring: 0, correct: 5, total: 5, sim: false });
    expect(capped.next.freezes).toBe(MAX_FREEZES);
  });
});
