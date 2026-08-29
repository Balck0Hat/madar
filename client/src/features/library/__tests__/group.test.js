import { describe, it, expect } from "vitest";
import { groupByUnit } from "../utils/group";

const n = (id, unitId, page) => ({ id, unitId, page, text: id });

describe("groupByUnit", () => {
  it("should return an empty list for no notes", () => {
    expect(groupByUnit()).toEqual([]);
    expect(groupByUnit([])).toEqual([]);
  });

  it("should group by unit keeping the server's unit order", () => {
    const groups = groupByUnit([n("a", "center-1", 3), n("b", "human-1-1", 0), n("c", "center-1", 1)]);
    expect(groups.map((g) => g.unitId)).toEqual(["center-1", "human-1-1"]);
    expect(groups[0].notes).toHaveLength(2);
  });

  it("should sort each unit's notes by page so they read in lesson order", () => {
    const groups = groupByUnit([n("a", "center-1", 5), n("c", "center-1", 1), n("b", "center-1", 3)]);
    expect(groups[0].notes.map((x) => x.page)).toEqual([1, 3, 5]);
  });
});
