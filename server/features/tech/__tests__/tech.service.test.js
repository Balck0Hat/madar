import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as tech from "../tech.service.js";
import TechMark from "../techMark.model.js";
import { BRANCHES, TOPIC_IDS, LEVELS } from "../../../shared/data/tech/tree.js";
import { TOPICS } from "../../../shared/data/tech/index.js";

beforeEach(async () => { await TechMark.deleteMany({}); });

describe("tech service", () => {
  it("should expose the whole tree with unique topic ids and levels, without content", async () => {
    const t = await tech.tree(new mongoose.Types.ObjectId());
    expect(t.branches.length).toBe(BRANCHES.length);
    const topics = t.branches.flatMap((b) => b.groups.flatMap((g) => g.topics));
    expect(topics.length).toBe(TOPIC_IDS.length);
    expect(new Set(topics.map((x) => x.id)).size).toBe(TOPIC_IDS.length);
    expect(topics.every((x) => x.how === undefined && x.myths === undefined)).toBe(true);
    expect(topics.filter((x) => x.ready).every((x) => LEVELS.includes(x.level))).toBe(true);
    expect(t.total).toBe(TOPICS.size);
  });

  it("should return a full topic with path, related, prev/next, and 404 for unknown ids", async () => {
    const id = [...TOPICS.keys()][0];
    if (!id) return; // المحتوى لم يُكتب بعد في هذه البيئة
    const t = await tech.topic(new mongoose.Types.ObjectId(), id);
    expect(t.path.branch.title).toBeTruthy();
    expect(t.how.length).toBeGreaterThanOrEqual(3);
    expect(t.myths.length).toBeGreaterThanOrEqual(2);
    expect(t.related.every((r) => r.title)).toBe(true);
    expect(t.prev).toBeNull();
    expect(t.next?.title || null).not.toBeUndefined();
    await expect(tech.topic(new mongoose.Types.ObjectId(), "nope")).rejects.toMatchObject({ code: "TOPIC_NOT_FOUND" });
  });

  it("should toggle a bookmark and reflect it in the tree", async () => {
    const user = new mongoose.Types.ObjectId();
    const id = [...TOPICS.keys()][0];
    if (!id) return;
    expect(await tech.toggleMark(user, id)).toEqual({ marked: true });
    const t = await tech.tree(user);
    expect(t.branches.flatMap((b) => b.groups.flatMap((g) => g.topics)).find((x) => x.id === id).marked).toBe(true);
    expect(t.marked).toEqual([id]);
    expect(await tech.toggleMark(user, id)).toEqual({ marked: false });
    await expect(tech.toggleMark(user, "nope")).rejects.toMatchObject({ code: "TOPIC_NOT_FOUND" });
  });

  it("should serve a branch's interview questions grouped by topic, and 404 for an unknown branch", () => {
    const b = BRANCHES[0];
    const r = tech.interview(b.id);
    expect(r.branch.id).toBe(b.id);
    expect(r.groups.length).toBe(b.groups.length);
    expect(r.total).toBe(r.groups.reduce((n, g) => n + g.topics.reduce((m, t) => m + t.questions.length, 0), 0));
    for (const g of r.groups) for (const t of g.topics) for (const q of t.questions) { expect(q.q).toBeTruthy(); expect(q.a).toBeTruthy(); expect(LEVELS).toContain(q.level); }
    expect(() => tech.interview("nope")).toThrow();
  });

  it("should search Arabic and English titles and terms, and return nothing for an empty query", () => {
    expect(tech.search("")).toEqual([]);
    if (!TOPICS.size) return;
    const first = [...TOPICS.values()][0];
    expect(tech.search(first.en.split(" ")[0]).some((h) => h.id === first.id)).toBe(true);
    expect(tech.search(first.title.slice(0, 4))[0].score).toBe(2);
    expect(tech.search("zzzzqq")).toEqual([]);
  });
});
