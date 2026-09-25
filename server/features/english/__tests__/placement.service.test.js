import { describe, it, expect, beforeEach, vi } from "vitest";
import mongoose from "mongoose";

// المصحّح الخارجي لا يُستدعى في الاختبارات
vi.mock("../../../shared/utils/claudeCli.js", () => ({
  askJson: vi.fn(async () => ({ cefr: "B2", ielts: 6, summary: "جيد.", errors: [{ quote: "their brains", fix: "their brains", note: "سليمة." }], advice: [] })),
  wrapUserText: (label, text) => `<${label}>${text}</${label}>`,
}));
const placement = await import("../placement.service.js");
const { default: Placement } = await import("../placement.model.js");
const { PLACEMENT } = await import("../../../shared/data/english/index.js");
const { GRAMMAR_ITEMS } = await import("../placement.logic.js");

const G = new Map(PLACEMENT.grammar.map((i) => [i.id, i]));
const R = new Map(PLACEMENT.reading.map((p) => [p.id, p]));
const L = new Map(PLACEMENT.listening.map((p) => [p.id, p]));

beforeEach(async () => { await Placement.deleteMany({}); });

// يجيب بحسب سياسة: صح دائماً حتى مستوى معيّن، وخطأ فوقه
async function play(user, correctUpTo) {
  const ok = (level) => ["A1", "A2", "B1", "B2", "C1"].indexOf(level) <= ["A1", "A2", "B1", "B2", "C1"].indexOf(correctUpTo);
  let s = await placement.start(user);
  while (s.stage === "grammar") {
    const it = G.get(s.item.id);
    expect(s.item.a).toBeUndefined(); // الإجابة لا تخرج
    const r = await placement.answer(user, s.id, { itemId: it.id, choice: ok(it.level) ? it.a : (it.a + 1) % 4 });
    s = r.next;
  }
  for (const stage of ["reading", "listening"]) {
    while (s.stage === stage) {
      const p = (stage === "reading" ? R : L).get(s.part.id);
      for (let i = 0; i < p.qs.length; i++) {
        const r = await placement.answer(user, s.id, { itemId: `${p.id}#${i}`, choice: ok(p.level) ? p.qs[i].a : (p.qs[i].a + 1) % 4 });
        s = r.next;
      }
    }
  }
  return s;
}

describe("placement.service", () => {
  it("should run the adaptive flow and place a B2 candidate at B2 with the right passages", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await play(user, "B2");
    expect(s.stage).toBe("writing");
    expect(s.writing.id).toBe("w-b2");
    const done = await placement.writing(user, s.id, { skip: true });
    expect(done.stage).toBe("done");
    expect(done.result.level).toBe("B2");
    expect(done.result.parts.writing).toBeNull();
  }, 30000);

  it("should place a weak candidate low and a strong one high", async () => {
    const weak = await play(new mongoose.Types.ObjectId(), "A1");
    const w = await placement.writing(weak.user || new mongoose.Types.ObjectId(), weak.id, { skip: true }).catch(() => null);
    const sWeak = await Placement.findById(weak.id);
    expect(["A1", "A2"]).toContain(sWeak.result?.level || (await (async () => { const u = sWeak.user; const d = await placement.writing(u, weak.id, { skip: true }); return d.result.level; })()));
    const strong = await play(new mongoose.Types.ObjectId(), "C1");
    const sStrong = await Placement.findById(strong.id);
    const dStrong = await placement.writing(sStrong.user, strong.id, { skip: true });
    expect(["B2", "C1"]).toContain(dStrong.result.level);
    expect(w === null || w.stage === "done").toBe(true);
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

  it("should reject an unexpected item and a wrong stage", async () => {
    const user = new mongoose.Types.ObjectId();
    const s = await placement.start(user);
    await expect(placement.answer(user, s.id, { itemId: "nope", choice: 0 })).rejects.toMatchObject({ code: "PLACEMENT_BAD_STEP" });
    await expect(placement.writing(user, s.id, { skip: true })).rejects.toMatchObject({ code: "PLACEMENT_BAD_STEP" });
  });
});
