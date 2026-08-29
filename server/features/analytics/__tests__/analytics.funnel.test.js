import { describe, it, expect } from "vitest";
import { funnelRows, dropOff, median } from "../analytics.funnel.js";

const reader = (unitId, furthest, { quizStarted = false, finished = false } = {}) => ({ unitId, furthest, opened: true, quizStarted, finished });

describe("analytics.funnel (pure)", () => {
  it("should take the middle value as the median furthest page", () => {
    expect(median([1, 9, 3])).toBe(3);
    expect(median([2, 4, 6, 8])).toBe(5);
    expect(median([])).toBe(0);
  });

  it("should name the page after which most readers never continued", () => {
    const readers = [reader("center-1", 4), reader("center-1", 4), reader("center-1", 7), reader("center-1", 9, { finished: true })];
    expect(dropOff(readers)).toEqual({ page: 4, count: 2 });
  });

  it("should ignore finishers when looking for the drop-off page", () => {
    const readers = [reader("center-1", 3, { finished: true }), reader("center-1", 3, { finished: true }), reader("center-1", 6)];
    expect(dropOff(readers).page).toBe(6);
  });

  it("should return a null drop-off page when nobody stopped mid-unit", () => {
    expect(dropOff([reader("center-1", 5, { finished: true })])).toEqual({ page: null, count: 0 });
  });

  it("should count opens, quiz starts, finishes and completion per unit", () => {
    const readers = [
      reader("center-1", 6, { quizStarted: true, finished: true }),
      reader("center-1", 6, { quizStarted: true }),
      reader("center-1", 2),
      reader("center-1", 2),
    ];
    const [row] = funnelRows(readers);
    expect(row).toMatchObject({ unitId: "center-1", opens: 4, quizStarts: 2, finishes: 1, completion: 25, medianPage: 4, dropOffPage: 2, dropOffShare: 50 });
    // من بلغ صفحة الوسيط أو تجاوزها
    expect(row.reached).toBe(2);
  });

  it("should sort the worst completion rate first", () => {
    const readers = [
      reader("good-1", 3, { finished: true }),
      reader("bad-1", 3),
      reader("bad-1", 3, { finished: false }),
    ];
    expect(funnelRows(readers).map((r) => r.unitId)).toEqual(["bad-1", "good-1"]);
  });
});
