import { describe, it, expect } from "vitest";
import { SEED_UNITS } from "../seed/index.js";

const withPoints = SEED_UNITS.flatMap((u) => (u.cards || []).filter((c) => c.points?.length).map((c) => ({ u: u.unitId, c })));

// التعداد المحشور في النثر يُقرأ سرداً لا قائمة. البنود انتُزعت من موضعها في
// الفقرة، وما بعدها انتقل إلى after حفاظاً على ترتيب الكلام — لا في الذيل.
describe("card points", () => {
  it("should exist only where a list was actually extracted", () => {
    expect(withPoints.length).toBeGreaterThan(15);
    // تجربة على مجال واحد أولاً: الإنسان
    expect(withPoints.every(({ u }) => u.startsWith("human-"))).toBe(true);
  });

  it("should never leave a card whose prose ends mid-sentence", () => {
    // النثر قبل القائمة ينتهي بنقطتين أو بعلامة وقف، لا بفاصلة معلّقة
    const bad = withPoints.filter(({ c }) => !/[:.؟!»]$/.test(c.p.trim()));
    expect(bad.map((b) => `${b.u} · ${b.c.h} → ${b.c.p.slice(-40)}`)).toEqual([]);
  });

  it("should hold at least three items in every list", () => {
    const thin = withPoints.filter(({ c }) => c.points.length < 3);
    expect(thin.map((b) => `${b.u} · ${b.c.h}`)).toEqual([]);
  });

  it("should keep every item short enough to scan", () => {
    const long = withPoints.flatMap(({ u, c }) =>
      c.points.filter((t) => t.trim().split(/\s+/).length > 22).map((t) => `${u} → ${t.slice(0, 40)}`));
    expect(long).toEqual([]);
  });

  it("should keep the card within the word limit counting points and tail", () => {
    const words = (s) => (String(s || "").trim() ? String(s).trim().split(/\s+/).length : 0);
    const over = withPoints.filter(({ c }) => words(c.p) + words(c.points.join(" ")) + words(c.after) > 170);
    expect(over.map((b) => b.u)).toEqual([]);
  });

  it("should carry no duplicate item inside one list", () => {
    const dupes = withPoints.filter(({ c }) => new Set(c.points).size !== c.points.length);
    expect(dupes.map((b) => `${b.u} · ${b.c.h}`)).toEqual([]);
  });
});
