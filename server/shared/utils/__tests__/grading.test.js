import { describe, it, expect } from "vitest";
import { scoreOf, weakQids, checkClosed } from "../grading.js";

describe("scoreOf", () => {
  it("should count scored questions only", () => {
    const graded = [{ qid: "a", scored: true, ok: true }, { qid: "b", scored: true, ok: false }, { qid: "c", scored: false, selfMark: "got" }];
    expect(scoreOf(graded)).toEqual({ correct: 1, total: 2 });
  });

  it("should pass a quiz that has nothing objectively gradable", () => {
    expect(scoreOf([{ qid: "o1", scored: false, selfMark: "unclear" }])).toEqual({ correct: 1, total: 1 });
  });
});

describe("weakQids", () => {
  it("should collect wrong closed answers and self-marked misunderstandings", () => {
    const graded = [
      { qid: "a", scored: true, ok: true },
      { qid: "b", scored: true, ok: false },
      { qid: "c", scored: false, selfMark: "got" },
      { qid: "d", scored: false, selfMark: "unclear" },
      { qid: "e", scored: false, selfMark: null },
    ];
    expect(weakQids(graded)).toEqual(["b", "d"]);
  });
});

describe("checkClosed", () => {
  it("should stay deterministic for closed types and refuse open ones", () => {
    expect(checkClosed({ t: "mcq", a: 2 }, 2)).toBe(true);
    expect(checkClosed({ t: "tf", a: false }, false)).toBe(true);
    expect(checkClosed({ t: "fill", a: ["xp"] }, " XP ")).toBe(true);
    expect(checkClosed({ t: "order", a: [1, 0] }, [1, 0])).toBe(true);
    expect(checkClosed({ t: "open" }, "أي نص")).toBe(false);
  });
});
