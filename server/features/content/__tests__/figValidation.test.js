import { describe, it, expect } from "vitest";
import { unitBody } from "../content.validation.js";

// حقل fig في المحرّر: الأنواع الثلاثة تُقبل، وما سواها يُرفض قبل أن يبلغ القاعدة
const base = { title: "وحدة للاختبار", cards: [], summary: [], goals: [], questions: [] };
const card = (fig) => ({ ...base, cards: [{ h: "بطاقة", p: "نصّ.", fig }] });

describe("card figure validation", () => {
  it("should accept a timeline, bars and layers", () => {
    expect(unitBody.safeParse(card({ t: "timeline", items: [{ y: "1796", l: "أ" }, { y: "1885", l: "ب" }, { y: "1980", l: "ج" }] })).success).toBe(true);
    expect(unitBody.safeParse(card({ t: "bars", unit: "سنة", items: [{ v: 1, l: "أ" }, { v: 2, l: "ب" }] })).success).toBe(true);
    expect(unitBody.safeParse(card({ t: "layers", items: ["أ", "ب", "ج"] })).success).toBe(true);
  });

  it("should reject an unknown kind and a too-short list", () => {
    expect(unitBody.safeParse(card({ t: "pie", items: [] })).success).toBe(false);
    expect(unitBody.safeParse(card({ t: "timeline", items: [{ y: "1796", l: "أ" }] })).success).toBe(false);
    expect(unitBody.safeParse(card({ t: "bars", items: [{ v: -1, l: "أ" }, { v: 2, l: "ب" }] })).success).toBe(false);
  });

  it("should still accept a card with no figure", () => {
    expect(unitBody.safeParse(card(undefined)).success).toBe(true);
  });
});
