import { describe, it, expect } from "vitest";
import { SCENES, sceneOf, toolOf, TOOL_OF } from "../index";
import { KIND } from "../nodeKinds";
import { TOPIC_IDS } from "../../../../../../server/shared/data/tech/tree.js";

// كل مشهد سليم: عقد فريدة داخل اللوحة، روابط ورزم تشير إلى عقد موجودة، وكل خطوة لها شرح
describe("network diagram scenes", () => {
  it("should register scenes whose links, hot sets and packets all point at existing nodes", () => {
    expect(SCENES.length).toBeGreaterThanOrEqual(32);
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length);
    for (const s of SCENES) {
      for (const n of s.nodes) expect(KIND[n.kind], `${s.id}/${n.id} kind ${n.kind}`).toBeDefined();
      const ids = s.nodes.map((n) => n.id);
      expect(new Set(ids).size, s.id).toBe(ids.length);
      for (const n of s.nodes) { expect(n.x, `${s.id}/${n.id}`).toBeGreaterThanOrEqual(0); expect(n.x).toBeLessThanOrEqual(100); expect(n.y).toBeGreaterThanOrEqual(0); expect(n.y).toBeLessThanOrEqual(100); }
      for (const [a, b] of s.links) { expect(ids, `${s.id} link ${a}-${b}`).toContain(a); expect(ids).toContain(b); }
      expect(s.steps.length, s.id).toBeGreaterThanOrEqual(3);
      for (const st of s.steps) {
        expect(st.caption.length, s.id).toBeGreaterThan(20);
        for (const h of st.hot || []) expect(ids, `${s.id} hot ${h}`).toContain(h);
        for (const p of st.packets || []) { expect(ids, `${s.id} packet ${p.from}`).toContain(p.from); expect(ids).toContain(p.to); expect(p.from).not.toBe(p.to); }
      }
    }
  });

  it("should only register scenes for topics that exist in the tech tree", () => {
    const ids = new Set(TOPIC_IDS);
    for (const s of SCENES) expect(ids.has(s.id), s.id).toBe(true);
    for (const id of Object.keys(TOOL_OF)) expect(ids.has(id), id).toBe(true);
  });

  it("should resolve a scene and a live tool by topic id and return null for topics without one", () => {
    expect(sceneOf("dns").title).toContain("الاسم");
    expect(sceneOf("python")).toBeNull();
    expect(toolOf("dns")).toBe("dns");
    expect(toolOf("bandwidth-latency")).toBe("ping");
    expect(toolOf("wifi")).toBeNull();
    expect(new Set(Object.values(TOOL_OF))).toEqual(new Set(["dns", "ip", "ping", "trace"]));
  });
});
