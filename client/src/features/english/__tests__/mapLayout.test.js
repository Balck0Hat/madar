import { describe, it, expect } from "vitest";
import { layout, ROW, X } from "../grammar/mapLayout";

const b = (id, hue, groups) => ({ id, title: id, en: id, hue, groups: groups.map(([gid, n]) => ({ id: gid, title: gid, en: gid, topics: Array.from({ length: n }, (_, i) => ({ id: `${gid}-${i}`, title: `${gid} ${i}`, level: "A1" })) })) });

describe("grammar map layout", () => {
  it("should split branches on two sides, keep topics in non-overlapping rows, and place groups at their topics' centre", () => {
    const m = layout([b("a", "violet", [["a1", 3], ["a2", 2]]), b("b", "blue", [["b1", 4]]), b("c", "teal", [["c1", 1]])]);
    const sideOf = (id) => Math.sign(m.byId.get(id).x);
    expect([sideOf("a"), sideOf("b"), sideOf("c")]).toEqual([1, -1, 1]); // بالتناوب
    const right = m.nodes.filter((n) => n.kind === "topic" && n.side === 1).sort((p, q) => p.y - q.y);
    for (let i = 1; i < right.length; i++) expect(right[i].y - right[i - 1].y).toBeGreaterThanOrEqual(ROW);
    const g = m.byId.get("a1"), ts = ["a1-0", "a1-1", "a1-2"].map((id) => m.byId.get(id).y);
    expect(g.y).toBeCloseTo((ts[0] + ts[2]) / 2);
    expect(Math.abs(m.byId.get("a1-0").x)).toBe(X.topic);
    expect(m.byId.get("root")).toMatchObject({ x: 0, y: 0, kind: "center" });
  });

  it("should link root to branches, branches to groups, and groups to topics with the branch hue", () => {
    const m = layout([b("a", "pink", [["a1", 2]])]);
    expect(m.edges.map((e) => `${e.from}>${e.to}`)).toEqual(["a1>a1-0", "a1>a1-1", "a>a1", "root>a"]);
    expect(new Set(m.edges.map((e) => e.hue)).size).toBe(1);
    expect(m.width).toBeGreaterThan(X.topic * 2);
    expect(m.height).toBeGreaterThan(2 * ROW);
  });
});
