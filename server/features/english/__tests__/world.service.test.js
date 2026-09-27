import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as world from "../world.service.js";
import * as practice from "../practice.service.js";
import Practice from "../practice.model.js";
import Placement from "../placement.model.js";
import { ISLANDS, BOSS_ITEMS } from "../../../shared/data/english/tracks/world.js";
import { PLACEMENT } from "../../../shared/data/english/index.js";
import { LESSONS } from "../../../shared/data/english/tracks/index.js";

const G = new Map(PLACEMENT.grammar.map((i) => [i.id, i]));
const keyOf = (id) => (id.startsWith("lesson:") ? LESSONS.find((l) => l.tag === id.slice(7).split("#")[0]).qs[Number(id.split("#")[1])].a : G.get(id).a);
const master = (user, tag) => Practice.create({ user, kind: "lesson", track: "general", refId: tag, score: { raw: 8, total: 8, pct: 100 }, finishedAt: new Date() });

beforeEach(async () => { await Practice.deleteMany({}); await Placement.deleteMany({}); });

describe("world service", () => {
  it("should describe the world for a new user with titles, topics, a quest and a player position", async () => {
    const w = await world.getWorld(new mongoose.Types.ObjectId());
    expect(w.islands.length).toBe(7);
    expect(w.islands[0].nodes[0]).toMatchObject({ tag: "be-have", title: "فعل الكينونة والملكية", status: "available" });
    expect(w.islands[0].nodes[0].topics.length).toBeGreaterThan(2);
    expect(w.quest).toBe("be-have");
    expect(w.player).toBe("be-have");
    expect(w.friends).toEqual([]);
    expect(w.bossItems).toBe(BOSS_ITEMS);
  });

  it("should count mastery from lesson and weak practice and from a strong placement result", async () => {
    const user = new mongoose.Types.ObjectId();
    await master(user, "be-have");
    await Placement.create({ user, stage: "done", result: { level: "B1", skills: { all: [{ key: "pronouns", n: 3, ok: 3, rate: 100 }, { key: "questions", n: 1, ok: 1, rate: 100 }], weak: [{ key: "quantifiers" }] } }, finishedAt: new Date() });
    const w = await world.getWorld(user);
    const node = (t) => w.islands.flatMap((i) => i.nodes).find((n) => n.tag === t);
    expect(node("be-have").status).toBe("mastered");
    expect(node("pronouns").status).toBe("mastered"); // من اختبار المستوى بثلاثة أسئلة
    expect(node("questions").status).toBe("available"); // سؤال واحد لا يكفي
    expect(node("articles").status).toBe("available");
    expect(w.quest).toBe("questions"); // الأضعف quantifiers مقفل، فأول متاح
  });

  it("should refuse the boss until the island is mastered, then run it and unlock the next island on a pass", async () => {
    const user = new mongoose.Types.ObjectId();
    await expect(world.startBoss(user, "sentence")).rejects.toMatchObject({ code: "BOSS_LOCKED" });
    for (const t of ISLANDS[0].nodes) await master(user, t);
    const { attempt, items, label } = await world.startBoss(user, "sentence");
    expect(label).toBe("زعيم ابنِ الجملة");
    expect(items.length).toBe(BOSS_ITEMS);
    expect(new Set(items.map((i) => G.get(i.id)?.tag || i.id.slice(7).split("#")[0])).size).toBe(ISLANDS[0].nodes.length); // كل مواضيع الجزيرة
    expect(items.every((i) => i.a === undefined)).toBe(true);
    let r;
    for (const it of items) r = await practice.answerPractice(user, attempt.id, { itemId: it.id, choice: keyOf(it.id) });
    expect(r.done).toBe(true);
    expect(r.score.pct).toBe(100);
    const w = await world.getWorld(user);
    expect(w.islands[0].boss.status).toBe("passed");
    expect(w.islands[1].open).toBe(true);
    expect(w.bosses).toBe(1);
    await expect(world.startBoss(user, "nope")).rejects.toMatchObject({ code: "ISLAND_NOT_FOUND" });
  });
});
