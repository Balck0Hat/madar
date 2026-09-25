import { describe, it, expect } from "vitest";
import { skills, kinds, plan } from "../placement.report.js";
import { calibratedLevel, MIN_ASKED } from "../placement.calibrate.js";

const items = new Map([["g1", { tag: "perfect" }], ["g2", { tag: "perfect" }], ["g3", { tag: "articles" }], ["g4", { tag: "articles" }], ["g5", { tag: "phrasal" }]]);

describe("placement report", () => {
  it("should tally answers by topic, list the weak topics first, and label them in Arabic", () => {
    const r = skills([
      { itemId: "g1", correct: false }, { itemId: "g2", correct: false }, { itemId: "g3", correct: true }, { itemId: "g4", correct: true }, { itemId: "g5", correct: true }, { itemId: "zz", correct: true },
    ], items);
    expect(r.all.map((s) => [s.key, s.rate])).toEqual([["perfect", 0], ["articles", 100], ["phrasal", 100]]);
    expect(r.weak.map((s) => s.key)).toEqual(["perfect"]);
    expect(r.strong.map((s) => s.key)).toEqual(["articles"]); // سؤال واحد لا يكفي للقوة
    expect(r.all[0].label).toBe("الأزمنة التامة");
  });

  it("should tally reading and listening answers by question kind", () => {
    const pools = { reading: [{ id: "r1", qs: [{ k: "detail" }, { k: "gap" }] }], listening: [{ id: "l1", qs: [{ k: "detail" }] }] };
    const parts = { reading: { answers: [{ itemId: "r1#0", correct: true }, { itemId: "r1#1", correct: false }] }, listening: { answers: [{ itemId: "l1#0", correct: true }] } };
    expect(kinds(parts, pools).map((k) => [k.key, k.n, k.rate])).toEqual([["gap", 1, 0], ["detail", 2, 100]]);
  });

  it("should build a two-week plan from the weak topics and the level", () => {
    const p = plan("B1", [{ key: "perfect", label: "الأزمنة التامة" }], [{ key: "gap", label: "إكمال الفراغ" }]);
    expect(p).toHaveLength(2);
    expect(p[0].items[0]).toMatch(/^الأزمنة التامة: have done/);
    expect(p[0].items[1]).toContain("إكمال الفراغ");
    expect(p[1].items.at(-1)).toContain("أعد اختبار المستوى");
    expect(plan("C1", [], [])[1].items.at(-1)).toContain("نماذج الامتحان");
  });

  it("should recalibrate an item only after enough answers: too hard goes up, too easy goes down", () => {
    expect(calibratedLevel({ level: "B1", asked: MIN_ASKED - 1, correct: 0 })).toBeNull();
    expect(calibratedLevel({ level: "B1", asked: 40, correct: 10 })).toBe("B2");
    expect(calibratedLevel({ level: "B1", asked: 40, correct: 38 })).toBe("A2");
    expect(calibratedLevel({ level: "B1", asked: 40, correct: 25 })).toBeNull();
    expect(calibratedLevel({ level: "C1", asked: 40, correct: 5 })).toBeNull(); // لا أعلى من القمة
    expect(calibratedLevel({ level: "A1", asked: 40, correct: 40 })).toBeNull();
  });
});
