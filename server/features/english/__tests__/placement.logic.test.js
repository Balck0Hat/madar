import { describe, it, expect } from "vitest";
import { nextLevel, estimateLevel, pickTwo, partLevel, overall, recommend, shouldStop, confidence, GRAMMAR_MIN, GRAMMAR_MAX } from "../placement.logic.js";

const ans = (pairs) => pairs.map(([level, correct]) => ({ itemId: "x", level, correct }));

describe("placement logic", () => {
  it("should start at B1, climb after two correct in a row, and drop after one wrong", () => {
    expect(nextLevel([])).toBe("B1");
    expect(nextLevel(ans([["B1", true]]))).toBe("B1");
    expect(nextLevel(ans([["B1", true], ["B1", true]]))).toBe("B2");
    expect(nextLevel(ans([["B1", true], ["B1", true], ["B2", false]]))).toBe("B1");
    expect(nextLevel(ans(Array(12).fill(["x", true])))).toBe("C1"); // لا يتجاوز القمة
    expect(nextLevel(ans(Array(6).fill(["x", false])))).toBe("A1");
  });

  it("should estimate the highest level answered at 60% or better over at least three items", () => {
    expect(estimateLevel(ans([["B1", true], ["B1", true], ["B2", true], ["B2", false], ["B2", true], ["C1", false], ["C1", false], ["C1", true]]))).toBe("B2");
    expect(estimateLevel(ans([["B1", false], ["A2", false], ["A1", true], ["A1", true], ["A1", false]]))).toBe("A1");
    expect(estimateLevel([])).toBeNull();
  });

  it("should pick a passage at the level and one a step above, falling back below at the top", () => {
    const pool = [{ id: "a2", level: "A2" }, { id: "b1", level: "B1" }, { id: "b2a", level: "B2" }, { id: "b2b", level: "B2" }, { id: "c1", level: "C1" }];
    const first = () => 0;
    expect(pickTwo(pool, "B1", new Set(), first).map((p) => p.id)).toEqual(["b1", "b2a"]);
    expect(pickTwo(pool, "C1", new Set(), first).map((p) => p.id)).toEqual(["c1", "b2a"]);
    expect(pickTwo(pool, "B2", new Set(), first).map((p) => p.id)).toEqual(["b2a", "c1"]);
    expect(pickTwo(pool, "B2", new Set(["b2a"]), first).map((p) => p.id)).toEqual(["b2b", "c1"]); // ما رآه من قبل يُؤخَّر
    expect(pickTwo(pool, "B1", new Set(["b1"]), first)[0].id).toBe("b1"); // ولا بديل فيُعاد
  });

  it("should stop after the minimum once the ladder settles on two adjacent levels, and always at the maximum", () => {
    const settled = ans([["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false]]);
    expect(settled.length).toBe(GRAMMAR_MIN);
    expect(shouldStop(settled.slice(0, -1))).toBe(false);
    expect(shouldStop(settled)).toBe(true);
    const swinging = ans([["B1", true], ["B1", true], ["B2", true], ["B2", true], ["C1", false], ["B2", false], ["B1", false], ["A2", true], ["A2", true], ["B1", true], ["B1", true], ["B2", true], ["B2", false]]);
    expect(shouldStop(swinging)).toBe(false);
    expect(shouldStop(ans(Array(GRAMMAR_MAX).fill(["B1", true]).map((x, i) => [i % 3 ? "B1" : "C1", i % 2 === 0])))).toBe(true);
  });

  it("should rate confidence high when the level is hit clearly and the one above is failed, low when unsettled", () => {
    const clear = ans([["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false]]);
    expect(confidence(clear)).toEqual({ level: "B1", confidence: "high", range: ["B1", "B1"] });
    const fuzzy = ans([["B1", true], ["B1", true], ["B2", true], ["B2", false], ["B1", true], ["B1", true], ["B2", false], ["B1", true], ["B1", true], ["B2", true], ["B2", false], ["B1", false]]);
    const f = confidence(fuzzy);
    expect(f.confidence).toBe("medium");
    expect(f.range).toEqual(["B1", "B2"]);
    expect(confidence(ans([["B1", true], ["B1", true], ["B2", false]])).confidence).toBe("low");
    expect(confidence([])).toEqual({ level: null, confidence: "low", range: [] });
    expect(confidence(ans(Array(12).fill(["C1", true]))).confidence).toBe("high"); // القمة: لا مستوى فوقها
  });

  it("should grade a part by the highest passage passed at 60%", () => {
    const pool = [{ id: "b1", level: "B1" }, { id: "b2", level: "B2" }];
    const part = { ids: ["b1", "b2"], answers: [
      { itemId: "b1#0", correct: true }, { itemId: "b1#1", correct: true }, { itemId: "b1#2", correct: false },
      { itemId: "b2#0", correct: false }, { itemId: "b2#1", correct: true }, { itemId: "b2#2", correct: false },
    ] };
    expect(partLevel(part, pool)).toBe("B1");
    expect(partLevel({ ids: ["b1"], answers: [{ itemId: "b1#0", correct: false }, { itemId: "b1#1", correct: false }] }, pool)).toBe("A2");
  });

  it("should take the median of the parts and let writing nudge it by one step at most", () => {
    expect(overall({ grammar: "B2", reading: "B1", listening: "B2" }).level).toBe("B2");
    expect(overall({ grammar: "B2", reading: "B1", listening: "B2", writing: "A1" }).level).toBe("B1");
    expect(overall({ grammar: "B1", reading: "B1", listening: "B1", writing: "C1" }).level).toBe("B2");
    expect(overall({ grammar: "B1", reading: "B1", listening: "B1" }).ielts).toBe("4 إلى 5");
    expect(recommend("A2").track).toBe("general");
    expect(recommend("B2").track).toBe("ielts");
  });
});
