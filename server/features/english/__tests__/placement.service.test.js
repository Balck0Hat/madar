import { describe, it, expect, beforeEach, vi } from "vitest";
import mongoose from "mongoose";

// المصحّح الخارجي لا يُستدعى في الاختبارات
vi.mock("../../../shared/utils/claudeCli.js", () => ({
  askJson: vi.fn(async () => ({ cefr: "B2", ielts: 6, summary: "جيد.", errors: [{ quote: "their brains", fix: "their brains", note: "سليمة." }], advice: [] })),
  wrapUserText: (label, text) => `<${label}>${text}</${label}>`,
}));
const placement = await import("../placement.service.js");
const { default: Placement } = await import("../placement.model.js");
const { default: ItemStat } = await import("../itemStat.model.js");
const { PLACEMENT } = await import("../../../shared/data/english/index.js");
const { GRAMMAR_MIN, GRAMMAR_MAX } = await import("../placement.logic.js");
const { BUDGET } = await import("../placement.flow.js");

const G = new Map(PLACEMENT.grammar.map((i) => [i.id, i]));
const R = new Map(PLACEMENT.reading.map((p) => [p.id, p]));
const L = new Map(PLACEMENT.listening.map((p) => [p.id, p]));
const right = (q) => (q.type === "gap" ? q.answers[0] : q.a);
const wrong = (q) => (q.type === "gap" ? "zzz" : (q.a + 1) % (q.opts?.length || 4));

beforeEach(async () => { await Placement.deleteMany({}); await ItemStat.deleteMany({}); });

// يجيب بحسب سياسة: صح دائماً حتى مستوى معيّن، وخطأ فوقه
async function play(user, correctUpTo, { stopAt = null } = {}) {
  const ok = (level) => ["A1", "A2", "B1", "B2", "C1"].indexOf(level) <= ["A1", "A2", "B1", "B2", "C1"].indexOf(correctUpTo);
  let s = await placement.start(user);
  while (s.stage === "grammar") {
    const it = G.get(s.item.id);
    expect(it.a === undefined || s.item.a === undefined).toBe(true); // الإجابة لا تخرج
    const r = await placement.answer(user, s.id, { itemId: it.id, choice: ok(it.level) ? it.a : (it.a + 1) % 4 });
    s = r.next;
  }
  for (const stage of ["reading", "listening"]) {
    if (stopAt === stage) return s;
    while (s.stage === stage) {
      const p = (stage === "reading" ? R : L).get(s.part.id);
      expect(s.part.qs.every((q) => q.a === undefined && q.answers === undefined)).toBe(true);
      for (let i = s.part.from; i < p.qs.length; i++) {
        const r = await placement.answer(user, s.id, { itemId: `${p.id}#${i}`, choice: ok(p.level) ? right(p.qs[i]) : wrong(p.qs[i]) });
        s = r.next;
      }
    }
  }
  return s;
}

describe("placement.service", () => {
  it("should run the adaptive flow, stop between the min and max, and place a B2 candidate at B2 with a report", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await play(user, "B2");
    expect(s.stage).toBe("writing");
    expect(s.writing.id).toBe("w-b2");
    const doc = await Placement.findById(s.id);
    expect(doc.grammar.answers.length).toBeGreaterThanOrEqual(GRAMMAR_MIN);
    expect(doc.grammar.answers.length).toBeLessThanOrEqual(GRAMMAR_MAX);
    expect(doc.reading.startedAt).toBeInstanceOf(Date);
    const done = await placement.writing(user, s.id, { skip: true });
    expect(done.stage).toBe("done");
    expect(done.result.level).toBe("B2");
    expect(done.result.confidence).toBe("high");
    expect(done.result.parts.writing).toBeNull();
    expect(done.result.skills.all.length).toBeGreaterThan(0);
    expect(done.result.kinds.some((k) => k.key === "gap")).toBe(true);
    expect(done.result.kinds.find((k) => k.key === "detail").rate).toBeGreaterThan(0); // الإجابات الصحيحة تُعدّ فعلاً
    expect(done.result.skills.all.some((t) => t.rate === 100)).toBe(true);
    expect(done.result.plan).toHaveLength(2);
    expect(await ItemStat.countDocuments()).toBe(doc.grammar.answers.length + doc.reading.answers.length + doc.listening.answers.length);
  }, 30000);

  it("should place a weak candidate low and a strong one high", async () => {
    const weakUser = new mongoose.Types.ObjectId();
    const weak = await play(weakUser, "A1");
    const dWeak = await placement.writing(weakUser, weak.id, { skip: true });
    expect(["A1", "A2"]).toContain(dWeak.result.level);
    const strongUser = new mongoose.Types.ObjectId();
    const strong = await play(strongUser, "C1");
    const dStrong = await placement.writing(strongUser, strong.id, { skip: true });
    expect(["B2", "C1"]).toContain(dStrong.result.level);
  }, 30000);

  it("should grade a gap answer by normalised text and reveal the accepted answer", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await play(user, "B1", { stopAt: "reading" });
    const p = R.get(s.part.id);
    const gi = p.qs.findIndex((q) => q.type === "gap");
    const r = await placement.answer(user, s.id, { itemId: `${p.id}#${gi}`, choice: ` ${p.qs[gi].answers[0].toUpperCase()}. ` });
    expect(r.correct).toBe(true);
    expect(r.a).toBe(p.qs[gi].answers[0]);
  }, 30000);

  it("should close a part when its time is up, counting unanswered questions as wrong", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await play(user, "B1", { stopAt: "reading" });
    await expect(placement.timeout(user, s.id)).rejects.toMatchObject({ code: "PLACEMENT_BAD_STEP" }); // لم ينتهِ بعد
    await Placement.updateOne({ _id: s.id }, { $set: { "reading.startedAt": new Date(Date.now() - (BUDGET.reading + 60) * 1000) } });
    const p = R.get(s.part.id);
    const late = await placement.answer(user, s.id, { itemId: `${p.id}#0`, choice: 0 });
    expect(late.timedOut).toBe(true);
    expect(late.next.stage).toBe("listening");
    const doc = await Placement.findById(s.id);
    expect(doc.reading.answers.filter((a) => a.timedOut).length).toBe(doc.reading.ids.reduce((n, id) => n + R.get(id).qs.length, 0));
  }, 30000);

  it("should grade the writing in the background and update the result", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await play(user, "B1");
    const v = await placement.writing(user, s.id, { text: "I think that children should learn languages early because their brains are flexible and they enjoy games." });
    expect(v.writing.status).toBe("pending");
    await new Promise((r) => setTimeout(r, 150));
    const after = await placement.current(user);
    expect(after.writing.status).toBe("done");
    expect(after.writing.cefr).toBe("B2");
    expect(after.result.parts.writing).toBe("B2");
    expect(after.writing.corrections).toHaveLength(1);
  }, 30000);

  it("should start a retake from the last level and compare the new result with it", async () => {
    const user = new mongoose.Types.ObjectId();
    const first = await play(user, "B1");
    const d1 = await placement.writing(user, first.id, { skip: true });
    expect(d1.result.previous).toBeUndefined();
    const second = await placement.start(user);
    expect((await Placement.findById(second.id)).startLevel).toBe(d1.result.level); // السلّم يبدأ من آخر مستوى
    expect(second.item.level).toBe(d1.result.level);
    let s = second;
    while (s.stage === "grammar") { const it = G.get(s.item.id); s = (await placement.answer(user, s.id, { itemId: it.id, choice: it.a })).next; }
    for (const stage of ["reading", "listening"]) while (s.stage === stage) { const p = (stage === "reading" ? R : L).get(s.part.id); for (let i = s.part.from; i < p.qs.length; i++) s = (await placement.answer(user, s.id, { itemId: `${p.id}#${i}`, choice: right(p.qs[i]) })).next; }
    const d2 = await placement.writing(user, s.id, { skip: true });
    expect(d2.result.previous.level).toBe(d1.result.level);
    expect(d2.result.previous.delta).toBe(["A1", "A2", "B1", "B2", "C1"].indexOf(d2.result.level) - ["A1", "A2", "B1", "B2", "C1"].indexOf(d1.result.level));
  }, 30000);

  it("should reject an unexpected item and a wrong stage", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await placement.start(user);
    await expect(placement.answer(user, s.id, { itemId: "nope", choice: 0 })).rejects.toMatchObject({ code: "PLACEMENT_BAD_STEP" });
    await expect(placement.writing(user, s.id, { skip: true })).rejects.toMatchObject({ code: "PLACEMENT_BAD_STEP" });
  });
});
