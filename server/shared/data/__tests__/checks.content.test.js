import { describe, it, expect } from "vitest";
import { mapChecks } from "../../../../client/src/features/unit/utils/checks.js";
import { SEED_UNITS } from "../seed/index.js";

// «سؤال سريع» بعد البطاقة: من بنك الوحدة نفسه، اختياريّ. الضمانة هنا أن
// المطابقة تغطّي المنهج فعلاً ولا تُسند سؤالاً محجوزاً للامتحان إلى بطاقة.
describe("self-check mapping across the whole curriculum", () => {
  const maps = SEED_UNITS.map((u) => ({ u, map: mapChecks(u.cards || [], (u.questions || []).filter((q) => !q.examOnly)) }));

  it("should give most cards a question", () => {
    const cards = maps.reduce((s, m) => s + m.map.length, 0);
    const hit = maps.reduce((s, m) => s + m.map.filter(Boolean).length, 0);
    expect(hit / cards).toBeGreaterThan(0.75);
  });

  it("should leave no unit without a single self-check", () => {
    expect(maps.filter((m) => !m.map.some(Boolean)).map((m) => m.u.unitId)).toEqual([]);
  });

  it("should never surface a reserved exam question", () => {
    const leaked = maps.flatMap((m) => m.map.filter((q) => q?.examOnly).map((q) => `${m.u.unitId}:${q.qid}`));
    expect(leaked).toEqual([]);
  });

  it("should never reuse a question on two cards of the same unit", () => {
    const dupes = maps.filter((m) => { const ids = m.map.filter(Boolean).map((q) => q.qid); return new Set(ids).size !== ids.length; });
    expect(dupes.map((m) => m.u.unitId)).toEqual([]);
  });

  it("should only pick closed questions that carry an answer and an explanation", () => {
    const bad = maps.flatMap((m) => m.map.filter((q) => q && (q.t === "open" || q.a === undefined)).map((q) => `${m.u.unitId}:${q.qid}`));
    expect(bad).toEqual([]);
  });
});
