import { describe, it, expect } from "vitest";
import { stats, nextUnit, eta } from "../progress";
import { uid } from "../units";
import { DOMAINS } from "../../data/domains";
import { RING1_TOTAL } from "../../data/curriculum";

const done = (ids) => Object.fromEntries(ids.map((id) => [id, { score: 10, total: 10, perfect: true, sim: false }]));

describe("stats", () => {
  it("should report zeros and rank 'زائر' on empty progress", () => {
    const s = stats({});
    expect(s.units).toBe(0);
    expect(s.rank).toBe("زائر");
    expect(s.ring1Done).toBe(false);
  });

  it("should detect a completed thread when both ends are done", () => {
    expect(stats(done(["human-1-3"])).threads).toBe(0);
    expect(stats(done(["human-1-3", "tech-1-7"])).threads).toBe(1);
  });

  it("should count a sector when all 8 ring-1 units of a domain are done", () => {
    const ids = Array.from({ length: 8 }).map((_, i) => uid("earth", 0, i));
    expect(stats(done(ids)).sectors).toBe(1);
    expect(stats(done(ids.slice(0, 7))).sectors).toBe(0);
  });

  it("should promote to 'مستكشف' after the center and one sector", () => {
    const ids = ["center-1", "center-2", "center-3", ...Array.from({ length: 8 }).map((_, i) => uid("life", 0, i))];
    expect(stats(done(ids)).rank).toBe("مستكشف");
  });

  it("should reach ring1Done and rank 'مثقف' when every ring-1 unit is complete", () => {
    const ids = ["center-1", "center-2", "center-3"];
    DOMAINS.forEach((d) => { for (let i = 0; i < 8; i++) ids.push(uid(d.id, 0, i)); });
    const s = stats(done(ids));
    expect(s.ring1Done).toBe(true);
    expect(s.rank).toBe("مثقف");
    expect(s.ring1Count).toBe(RING1_TOTAL);
  });
});

describe("nextUnit", () => {
  it("should start with the center units", () => {
    expect(nextUnit({}, "earth")).toBe("center-1");
    expect(nextUnit(done(["center-1"]), "earth")).toBe("center-2");
  });

  it("should continue with the favourite domain after the center", () => {
    expect(nextUnit(done(["center-1", "center-2", "center-3"]), "earth")).toBe("earth-1-1");
  });

  it("should return null when ring 1 is finished", () => {
    const ids = ["center-1", "center-2", "center-3"];
    DOMAINS.forEach((d) => { for (let i = 0; i < 8; i++) ids.push(uid(d.id, 0, i)); });
    expect(nextUnit(done(ids), "earth")).toBeNull();
  });
});

describe("eta", () => {
  it("should need fewer days at a faster pace", () => {
    expect(eta({}, 60).days).toBeLessThan(eta({}, 15).days);
    expect(eta({}, 40).days).toBe(RING1_TOTAL);
  });
});
