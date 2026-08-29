import { describe, it, expect } from "vitest";
import { checkAnswer, isReady, isPassed } from "../utils/quiz.utils";

describe("checkAnswer", () => {
  it("should accept the correct mcq index and reject others", () => {
    const q = { t: "mcq", a: 1 };
    expect(checkAnswer(q, 1)).toBe(true);
    expect(checkAnswer(q, 0)).toBe(false);
  });

  it("should compare true/false answers strictly", () => {
    expect(checkAnswer({ t: "tf", a: false }, false)).toBe(true);
    expect(checkAnswer({ t: "tf", a: false }, true)).toBe(false);
  });

  it("should accept fill answers case-insensitively, with Arabic-Indic digits and as substrings", () => {
    const q = { t: "fill", a: ["5", "6", "خمس"] };
    expect(checkAnswer(q, "٥")).toBe(true);
    expect(checkAnswer(q, "نحو 6 ساعات")).toBe(true);
    expect(checkAnswer(q, "XP".toLowerCase())).toBe(false);
    expect(checkAnswer({ t: "fill", a: ["xp"] }, "  XP ")).toBe(true);
  });

  it("should require the exact order for order questions", () => {
    const q = { t: "order", items: ["a", "b", "c"], a: [1, 2, 0] };
    expect(checkAnswer(q, [1, 2, 0])).toBe(true);
    expect(checkAnswer(q, [0, 1, 2])).toBe(false);
  });

  it("should accept open answers only when long enough", () => {
    expect(checkAnswer({ t: "open" }, "قصير")).toBe(false);
    expect(checkAnswer({ t: "open" }, "لأن النوم يثبت الذاكرة")).toBe(true);
  });

  it("should return false for an unknown question type", () => {
    expect(checkAnswer({ t: "nope" }, 1)).toBe(false);
  });
});

describe("isReady", () => {
  it("should be false with no selection", () => {
    expect(isReady({ t: "mcq" }, null)).toBe(false);
  });
  it("should require all items placed for order questions", () => {
    const q = { t: "order", items: ["a", "b"] };
    expect(isReady(q, [0])).toBe(false);
    expect(isReady(q, [0, 1])).toBe(true);
  });
  it("should reject whitespace-only text answers", () => {
    expect(isReady({ t: "fill" }, "   ")).toBe(false);
    expect(isReady({ t: "open" }, "x")).toBe(true);
  });
});

describe("isPassed", () => {
  it("should pass at 70% and fail below", () => {
    expect(isPassed(7, 10)).toBe(true);
    expect(isPassed(6, 10)).toBe(false);
  });
});
