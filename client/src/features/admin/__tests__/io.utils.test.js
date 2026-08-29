import { describe, it, expect } from "vitest";
import { parseUnitsPayload, countsOf, formatDelta, versionDelta } from "../utils/io.utils";

describe("parseUnitsPayload", () => {
  it("should accept a bare array, an export envelope and a single unit", () => {
    expect(parseUnitsPayload('[{"unitId":"a"},{"unitId":"b"}]')).toHaveLength(2);
    expect(parseUnitsPayload('{"units":[{"unitId":"a"}]}')).toEqual([{ unitId: "a" }]);
    expect(parseUnitsPayload('{"unitId":"a","title":"وحدة"}')).toEqual([{ unitId: "a", title: "وحدة" }]);
  });

  it("should reject empty input, broken json, an empty list and more than 100 units", () => {
    expect(() => parseUnitsPayload("   ")).toThrow(/الصق/);
    expect(() => parseUnitsPayload("{ليس json")).toThrow(/JSON غير صالح/);
    expect(() => parseUnitsPayload("[]")).toThrow(/لم نجد وحدات/);
    expect(() => parseUnitsPayload(JSON.stringify(Array.from({ length: 101 }, () => ({ unitId: "a" }))))).toThrow(/100/);
  });
});

describe("version count deltas", () => {
  it("should count cards and questions of a unit safely", () => {
    expect(countsOf({ cards: [1, 2], questions: [1] })).toEqual({ cards: 2, questions: 1 });
    expect(countsOf(null)).toEqual({ cards: 0, questions: 0 });
  });

  it("should show what restoring a version would change", () => {
    expect(versionDelta({ cards: 8, questions: 24 }, { cards: 10, questions: 20 })).toEqual({ cards: -2, questions: 4 });
    expect(formatDelta(4)).toBe("+4");
    expect(formatDelta(-2)).toBe("−2");
    expect(formatDelta(0)).toBe("");
  });
});
