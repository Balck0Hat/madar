import { describe, it, expect } from "vitest";
import { parseHero, formatHero } from "../utils/heroNum";

// رقم يومض بغير ما دُقّق أسوأ من رقم لا يتحرك: الأشكال الثمانية المقيسة
describe("hero number parsing", () => {
  it("should count a grouped number and regroup it", () => {
    const p = parseHero("40,000");
    expect(p).toMatchObject({ value: 40000, grouped: true });
    expect(formatHero(p, 40000)).toBe("40,000");
    expect(formatHero(p, 1234.4)).toBe("1,234");
  });

  it("should keep a percent suffix", () => {
    const p = parseHero("90%");
    expect(formatHero(p, 90)).toBe("90%");
  });

  it("should keep a word suffix and a prefix", () => {
    expect(formatHero(parseHero("100 ألف"), 100)).toBe("100 ألف");
    expect(formatHero(parseHero("+45 µs"), 45)).toBe("+45 µs");
    // «~2/3» رقمان: يُعرض ثابتاً كما كُتب
    expect(parseHero("~2/3")).toBeNull();
  });

  it("should keep decimals to the written precision", () => {
    expect(formatHero(parseHero("7.8 كم/ث"), 7.8)).toBe("7.8 كم/ث");
    expect(formatHero(parseHero("7.8 كم/ث"), 3.456)).toBe("3.5 كم/ث");
  });

  it("should flag a four-digit year so it dials from nearby, not from zero", () => {
    expect(parseHero("1847").year).toBe(true);
    expect(parseHero("2400").year).toBe(false);
  });

  it("should refuse a range or a dimension — a second number in the suffix", () => {
    expect(parseHero("80–95%")).toBeNull();
    expect(parseHero("77×53")).toBeNull();
  });

  it("should refuse text with no leading number", () => {
    expect(parseHero("كثير")).toBeNull();
    expect(parseHero("")).toBeNull();
  });
});
