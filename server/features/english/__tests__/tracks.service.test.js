import { describe, it, expect, beforeEach, vi } from "vitest";
import mongoose from "mongoose";

vi.mock("../../../shared/utils/claudeCli.js", () => ({
  askJson: vi.fn(async () => ({ band: 6.5, criteria: { task: 6, coherence: 7, lexis: 6, grammar: 7 }, summary: "جيد.", errors: [{ quote: "a", fix: "b", note: "c" }], advice: ["d"] })),
  wrapUserText: (label, text) => `<${label}>${text}</${label}>`,
}));
const tracks = await import("../tracks.service.js");
const practice = await import("../practice.service.js");
const { default: Practice } = await import("../practice.model.js");
const { default: Placement } = await import("../placement.model.js");
const { MODULES, LESSONS, moduleById } = await import("../../../shared/data/english/tracks/index.js");
const { PLACEMENT } = await import("../../../shared/data/english/index.js");

const right = (q) => (q.type === "gap" ? q.answers[0] : q.type === "multi" ? q.a : q.a);
beforeEach(async () => { await Practice.deleteMany({}); await Placement.deleteMany({}); });

describe("tracks + practice services", () => {
  it("should list the three tracks with modules, writing tasks and lessons", async () => {
    const o = await tracks.overview(new mongoose.Types.ObjectId());
    expect(o.tracks.map((t) => t.id)).toEqual(["general", "ielts", "toefl"]);
    expect(o.tracks[1].modules.map((m) => m.skill)).toEqual(["reading", "listening"]);
    expect(o.tracks[1].writing.length).toBe(4);
    expect(o.tracks[0].lessons.length).toBe(LESSONS.length);
    expect(o.weak).toEqual([]);
  });

  it("should run a module section by section, hide keys, add audio paths, and score with a band", async () => {
    const user = new mongoose.Types.ObjectId();
    const { module: m, attempt: none } = await tracks.getModule(user, "ielts-listening-1");
    expect(none).toBeNull();
    expect(m.sections[0].audio).toBe("/audio/english/ielts-listening-1-s1.mp3");
    expect(m.sections.every((s) => s.qs.every((q) => q.a === undefined && q.answers === undefined && q.why === undefined))).toBe(true);
    const a = await tracks.startModule(user, "ielts-listening-1");
    const full = moduleById("ielts-listening-1");
    let last;
    for (const s of full.sections) {
      const answers = s.qs.map((q, i) => ({ itemId: `${s.id}#${i}`, choice: i % 4 === 3 ? (q.type === "gap" ? "zzz" : 0) : right(q) }));
      last = await tracks.submitSection(user, a.id, { sectionId: s.id, answers });
      expect(last.graded.length).toBe(s.qs.length);
      expect(last.graded[0].why).toBeTruthy();
    }
    expect(last.done).toBe(true);
    expect(last.score.total).toBe(40);
    expect(last.score.band.scale).toBe("ielts");
    await expect(tracks.submitSection(user, a.id, { sectionId: "s1", answers: [] })).rejects.toMatchObject({ code: "PRACTICE_BAD_STEP" });
    const o = await tracks.overview(user);
    expect(o.tracks[1].modules[1].best.pct).toBe(last.score.pct);
  }, 30000);

  it("should run a lesson practice one item at a time and finish with a percentage", async () => {
    const user = new mongoose.Types.ObjectId();
    const lesson = practice.getLesson("perfect");
    expect(lesson.qs[0].a).toBeUndefined();
    const { attempt, items } = await practice.startPractice(user, "lesson", "perfect");
    expect(items.length).toBe(8);
    let r;
    for (const it of items) r = await practice.answerPractice(user, attempt.id, { itemId: it.id, choice: 0 });
    expect(r.done).toBe(true);
    expect(r.score.total).toBe(8);
    await expect(practice.answerPractice(user, attempt.id, { itemId: items[0].id, choice: 1 })).rejects.toMatchObject({ code: "PRACTICE_BAD_STEP" });
  });

  it("should pick ten unseen items of the weak tag, then show the tag in the overview with history", async () => {
    const user = new mongoose.Types.ObjectId();
    const seen = PLACEMENT.grammar.filter((i) => i.tag === "prepositions").slice(0, 3).map((i) => i.id);
    await Placement.create({ user, stage: "done", grammar: { ids: seen }, result: { level: "B1", skills: { weak: [{ key: "prepositions", label: "x", rate: 40 }] }, recommendation: { track: "general" } }, finishedAt: new Date() });
    const { items } = await practice.startPractice(user, "weak", "prepositions");
    expect(items.length).toBe(10);
    expect(items.every((i) => !seen.includes(i.id))).toBe(true);
    const G = new Map(PLACEMENT.grammar.map((i) => [i.id, i]));
    const keyOf = (id) => (id.startsWith("lesson:") ? LESSONS.find((l) => l.tag === "prepositions").qs[Number(id.split("#")[1])].a : G.get(id).a); // من الدرس أو من البنك
    const attemptId = (await Practice.findOne({ user, kind: "weak" }))._id;
    let r;
    for (const it of items) r = await practice.answerPractice(user, attemptId, { itemId: it.id, choice: keyOf(it.id) });
    expect(r.score.pct).toBe(100);
    const o = await tracks.overview(user);
    expect(o.weak[0]).toMatchObject({ tag: "prepositions", rate: 40, hasLesson: true });
    expect(o.weak[0].history.map((h) => h.pct)).toEqual([100]);
    await expect(practice.startPractice(user, "weak", "no-such-tag")).rejects.toMatchObject({ code: "TAG_NOT_FOUND" });
  });

  it("should grade a writing task in the background with the task rubric", async () => {
    const user = new mongoose.Types.ObjectId();
    const a = await practice.submitWriting(user, "ielts-w2-1", "Some people believe longer sentences reduce crime. I disagree because prisons rarely change behaviour, and prevention works better.");
    expect(a.writing.status).toBe("pending");
    await new Promise((r) => setTimeout(r, 150));
    const after = await practice.getAttempt(user, a.id);
    expect(after.writing.status).toBe("done");
    expect(after.writing.band).toBe(6.5);
    expect(after.writing.criteria.coherence).toBe(7);
    expect((await practice.writingHistory(user, "ielts-w2-1")).length).toBe(1);
    expect(() => practice.getWritingTask("nope")).toThrow();
  });
});
