import { describe, it, expect } from "vitest";
import { gradeQuestion, gradeSection, scoreModule, stripQuestion } from "../tracks.logic.js";
import { bandFor } from "../../../shared/data/english/tracks/index.js";

describe("tracks logic", () => {
  it("should grade every question type, forgiving case and punctuation in gaps but not extra words", () => {
    expect(gradeQuestion({ type: "mc", opts: ["a", "b", "c", "d"], a: 2 }, 2).score).toBe(1);
    expect(gradeQuestion({ type: "tfng", opts: ["True", "False", "Not given"], a: 1 }, "1").score).toBe(1);
    expect(gradeQuestion({ type: "gap", answers: ["forty-two", "42"], limit: 2 }, " Forty-Two. ").score).toBe(1);
    expect(gradeQuestion({ type: "gap", answers: ["iron"], limit: 1 }, "the iron").score).toBe(0); // كلمة زائدة على الحد
    expect(gradeQuestion({ type: "gap", answers: ["iron"], limit: 2 }, "").score).toBe(0);
    expect(gradeQuestion({ type: "heading", opts: ["i", "ii", "iii"], a: 0 }, 0).a).toBe(0);
  });

  it("should give partial credit for a summary question and never below zero", () => {
    const q = { type: "multi", opts: [1, 2, 3, 4, 5, 6], a: [0, 2, 4], pick: 3 };
    expect(gradeQuestion(q, [0, 2, 4]).score).toBe(1);
    expect(gradeQuestion(q, [0, 2, 5]).score).toBeCloseTo(1 / 3); // إصابتان وخطأ: 2-1 من 3
    expect(gradeQuestion(q, [1, 3, 5]).score).toBe(0);
    expect(gradeQuestion(q, "nope").score).toBe(0);
  });

  it("should grade a section, mark unanswered questions as skipped, and strip keys before sending", () => {
    const section = { id: "p1", qs: [{ k: "detail", opts: ["a", "b"], a: 1, why: "w1" }, { k: "gap", type: "gap", answers: ["nine"], why: "w2" }] };
    const g = gradeSection(section, [{ itemId: "p1#0", choice: 1 }]);
    expect(g.map((x) => [x.correct, x.skipped, x.a])).toEqual([[true, false, 1], [false, true, "nine"]]);
    expect(g[1].why).toBe("w2");
    expect(stripQuestion(section.qs[1])).toEqual({ k: "gap", type: "gap" });
  });

  it("should score a module with a band from the conversion table and the weakest kinds first", () => {
    const mod = { band: "ielts-reading", sections: [{ id: "p1", qs: Array(10).fill({ k: "detail" }) }, { id: "p2", qs: Array(10).fill({ k: "tfng" }) }] };
    const graded = [...Array(10).fill({ k: "detail", score: 1 }), ...Array(10).fill({ k: "tfng", score: 0.5 })];
    const s = scoreModule(mod, graded);
    expect(s).toMatchObject({ raw: 15, total: 20, pct: 75 });
    expect(s.band).toEqual({ scale: "ielts", value: 7 }); // 30 من 40
    expect(s.kinds[0].k).toBe("tfng");
  });

  it("should map raw scores to IELTS and TOEFL estimates", () => {
    expect(bandFor("ielts-listening", 40, 40).value).toBe(9);
    expect(bandFor("ielts-listening", 23, 40).value).toBe(6);
    expect(bandFor("ielts-reading", 3, 40).value).toBe(2);
    expect(bandFor("toefl-reading", 20, 20)).toEqual({ scale: "toefl", value: 30 });
    expect(bandFor("toefl-listening", 0, 11).value).toBe(0);
    expect(bandFor("nope", 5, 10)).toBeNull();
    expect(bandFor("ielts-reading", 0, 0)).toBeNull();
  });
});
