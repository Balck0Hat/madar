import { describe, it, expect } from "vitest";
import { isExamOnly, shuffleOptions } from "../exam.pool.js";
import { checkClosed } from "../../../shared/utils/grading.js";

const mcq = { qid: "q1", t: "mcq", q: "س", opts: ["أ", "ب", "ج", "د"], a: 2, examOnly: true };
const order = { qid: "q2", t: "order", q: "س", items: ["و1", "و2", "و3", "و4"], a: [2, 0, 3, 1], examOnly: true };

describe("exam.pool", () => {
  it("should accept only reserved closed questions", () => {
    expect(isExamOnly(mcq)).toBe(true);
    expect(isExamOnly({ ...mcq, examOnly: undefined })).toBe(false);
    expect(isExamOnly({ t: "open", examOnly: true, keywords: ["a"] })).toBe(false);
  });

  it("should keep the mcq answer pointing at the same option text after shuffling", () => {
    for (let i = 0; i < 40; i++) {
      const s = shuffleOptions(mcq);
      expect([...s.opts].sort()).toEqual([...mcq.opts].sort());
      expect(s.opts[s.a]).toBe(mcq.opts[mcq.a]);
      expect(checkClosed(s, s.a)).toBe(true);
      expect(checkClosed(s, s.opts.findIndex((o) => o !== mcq.opts[mcq.a]))).toBe(false);
    }
  });

  it("should keep the order answer pointing at the same item sequence after shuffling", () => {
    for (let i = 0; i < 40; i++) {
      const s = shuffleOptions(order);
      expect(s.a.map((k) => s.items[k])).toEqual(order.a.map((k) => order.items[k]));
      expect(checkClosed(s, s.a)).toBe(true);
    }
  });

  it("should leave true/false and fill questions untouched", () => {
    const tf = { qid: "q3", t: "tf", a: true };
    const fill = { qid: "q4", t: "fill", a: ["دوبامين"] };
    expect(shuffleOptions(tf)).toEqual(tf);
    expect(shuffleOptions(fill)).toEqual(fill);
  });

  it("should shuffle at least sometimes over many draws", () => {
    const seen = new Set(Array.from({ length: 60 }, () => shuffleOptions(mcq).opts.join("|")));
    expect(seen.size).toBeGreaterThan(3);
  });
});
