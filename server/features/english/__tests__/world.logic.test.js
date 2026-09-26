import { describe, it, expect } from "vitest";
import { computeWorld, dailyQuest, playerNode, pickBossItems } from "../world.logic.js";
import { ISLANDS } from "../../../shared/data/english/tracks/world.js";

const node = (w, tag) => w.islands.flatMap((i) => i.nodes).find((n) => n.tag === tag);

describe("world logic", () => {
  it("should open the first island and the side island, lock the rest, and gate nodes by their prerequisites", () => {
    const w = computeWorld({}, {});
    expect(w.islands.map((i) => [i.id, i.open])).toEqual([["base", true], ["time", false], ["verb", false], ["link", false], ["words", true]]);
    expect(node(w, "be-have").status).toBe("available"); // بلا متطلب
    expect(node(w, "pronouns").status).toBe("locked"); // يحتاج be-have
    expect(node(w, "daily-vocab").status).toBe("available");
    expect(node(w, "present").status).toBe("locked"); // جزيرة مقفلة
    expect(w.total).toBe(26);
    expect(w.mastered).toBe(0);
  });

  it("should unlock a node when its prerequisites are mastered and mark 75% as mastered", () => {
    const w = computeWorld({ "be-have": 80, pronouns: 74 }, {});
    expect(node(w, "be-have").status).toBe("mastered");
    expect(node(w, "pronouns").status).toBe("available"); // 74 لا يكفي
    expect(node(w, "questions").status).toBe("available");
    expect(node(w, "articles").status).toBe("locked"); // يحتاج pronouns
  });

  it("should make the boss available once every node is mastered, and open the next island once it is passed", () => {
    const all = Object.fromEntries(ISLANDS[0].nodes.map((t) => [t, 90]));
    let w = computeWorld(all, {});
    expect(w.islands[0].boss.status).toBe("available");
    expect(w.islands[1].open).toBe(false);
    w = computeWorld(all, { base: 60 });
    expect(w.islands[0].boss.status).toBe("available"); // 60 دون النجاح
    w = computeWorld(all, { base: 80 });
    expect(w.islands[0].boss.status).toBe("passed");
    expect(w.islands[1].open).toBe(true);
    expect(node(w, "present").status).toBe("available");
    expect(w.bosses).toBe(1);
  });

  it("should pick the daily quest from the weak tags when available, else the first available node", () => {
    const w = computeWorld({ "be-have": 90 }, {});
    expect(dailyQuest(w, ["articles", "questions"])).toBe("questions"); // articles مقفلة
    expect(dailyQuest(w, [])).toBe("pronouns");
    expect(playerNode(w)).toBe("be-have");
    expect(playerNode(computeWorld({}, {}))).toBe("be-have");
  });

  it("should spread boss items across the island tags, preferring unseen items, and shuffle", () => {
    const pool = ["a", "b", "c"].flatMap((t) => Array.from({ length: 10 }, (_, i) => ({ id: `${t}${i}`, tag: t })));
    const seen = new Set(["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"]);
    const items = pickBossItems(pool, ["a", "b", "c"], 9, seen, () => 0.5);
    expect(items.length).toBe(9);
    expect(items.filter((i) => i.tag === "a").length).toBe(3);
    expect(items.filter((i) => i.tag === "a").map((i) => i.id)).toContain("a9"); // غير المرئي أولاً
    expect(pickBossItems(pool, ["a"], 15, new Set()).length).toBe(10); // لا أكثر مما يوجد
  });
});
