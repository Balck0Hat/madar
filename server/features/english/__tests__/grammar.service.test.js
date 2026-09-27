import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as grammar from "../grammar.service.js";
import GrammarMark from "../grammarMark.model.js";
import Practice from "../practice.model.js";
import { TOPIC_IDS, BRANCHES } from "../../../shared/data/english/grammar/tree.js";
import { TOPICS } from "../../../shared/data/english/grammar/index.js";

beforeEach(async () => { await GrammarMark.deleteMany({}); await Practice.deleteMany({}); });

describe("grammar map service", () => {
  it("should expose the whole tree with a unique id per topic, its level band, and no content", async () => {
    const t = await grammar.tree(new mongoose.Types.ObjectId());
    expect(t.branches.length).toBe(BRANCHES.length);
    const topics = t.branches.flatMap((b) => b.groups.flatMap((g) => g.topics));
    expect(topics.length).toBe(TOPIC_IDS.length);
    expect(new Set(topics.map((x) => x.id)).size).toBe(TOPIC_IDS.length);
    expect(topics.every((x) => x.form === undefined && x.examples === undefined)).toBe(true);
    const ready = topics.filter((x) => x.ready);
    expect(ready.every((x) => ["basics", "intermediate", "advanced"].includes(x.band))).toBe(true);
    expect(t.total).toBe(TOPICS.size);
  });

  it("should return a full topic with its path and related topics, and 404 for an unknown id", async () => {
    const id = [...TOPICS.keys()][0];
    if (!id) return; // المحتوى لم يُكتب بعد في هذه البيئة
    const t = await grammar.topic(new mongoose.Types.ObjectId(), id);
    expect(t.path.branch.title).toBeTruthy();
    expect(t.form.length).toBeGreaterThan(1);
    expect(t.related.every((r) => r.title)).toBe(true);
    await expect(grammar.topic(new mongoose.Types.ObjectId(), "nope")).rejects.toMatchObject({ code: "TOPIC_NOT_FOUND" });
  });

  it("should toggle a bookmark and reflect it in the tree, and count mastery from practice", async () => {
    const user = new mongoose.Types.ObjectId();
    const id = [...TOPICS.keys()][0];
    if (!id) return;
    expect(await grammar.toggleMark(user, id)).toEqual({ marked: true });
    const tag = TOPICS.get(id).tag;
    await Practice.create({ user, kind: "lesson", track: "general", refId: tag, score: { raw: 8, total: 8, pct: 100 }, finishedAt: new Date() });
    const t = await grammar.tree(user);
    const node = t.branches.flatMap((b) => b.groups.flatMap((g) => g.topics)).find((x) => x.id === id);
    expect(node.marked).toBe(true);
    expect(node.mastery).toBe(100);
    expect(t.marked).toEqual([id]);
    expect(await grammar.toggleMark(user, id)).toEqual({ marked: false });
    await expect(grammar.toggleMark(user, "nope")).rejects.toMatchObject({ code: "TOPIC_NOT_FOUND" });
  });

  it("should search Arabic and English titles, rank title hits first, and return nothing for an empty query", () => {
    expect(grammar.search("")).toEqual([]);
    if (!TOPICS.size) return;
    const first = [...TOPICS.values()][0];
    const hits = grammar.search(first.en.split(" ")[0]);
    expect(hits.some((h) => h.id === first.id)).toBe(true);
    expect(grammar.search(first.title.slice(0, 4))[0].score).toBe(2);
    expect(grammar.search("zzzzqq")).toEqual([]);
  });
});
