import { describe, it, expect } from "vitest";
import { levelFromXp, xpForLevel, levelTitle, levelProgress } from "../level";

describe("level", () => {
  it("should start at level 1 with 0 xp", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(xpForLevel(1)).toBe(0);
  });

  it("should move to level 2 at exactly 100 xp", () => {
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(xpForLevel(2)).toBe(100);
  });

  it("should be consistent between levelFromXp and xpForLevel", () => {
    for (let n = 1; n < 30; n++) {
      expect(levelFromXp(xpForLevel(n))).toBe(n);
      expect(levelFromXp(xpForLevel(n + 1) - 1)).toBe(n);
    }
  });

  it("should map level ranges to titles", () => {
    expect(levelTitle(1)).toBe("شرارة");
    expect(levelTitle(10)).toBe("شعلة");
    expect(levelTitle(50)).toBe("شمس");
  });

  it("should compute progress inside the current level", () => {
    const p = levelProgress(110);
    expect(p.level).toBe(2);
    expect(p.cur).toBe(10);
    expect(p.need).toBe(200);
  });
});
