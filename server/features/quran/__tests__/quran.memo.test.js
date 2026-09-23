import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as memo from "../quran.memo.js";
import * as quran from "../quran.service.js";
import QuranMemo from "../quranMemo.model.js";

beforeEach(async () => { await QuranMemo.deleteMany({}); });

describe("quran.service text", () => {
  it("should serve suras, a sura with its ayahs, a page, and similar verses", () => {
    expect(quran.suras()).toHaveLength(114);
    const fatiha = quran.sura(1);
    expect(fatiha.ayahs).toHaveLength(7);
    expect(fatiha.ayahs[0].n).toBe("بسم الله الرحمن الرحيم");
    expect(quran.page(604).ayahs.map((a) => a.s)).toContain(114);
    expect(() => quran.sura(115)).toThrowError(expect.objectContaining({ code: "SURA_NOT_FOUND" }));
    const sim = quran.similar(2, 173);
    expect(Array.isArray(sim)).toBe(true);
  });
});

describe("quran.memo", () => {
  const user = () => new mongoose.Types.ObjectId();

  it("should expand a goal into ayahs in mushaf order for sura, juz and page goals", () => {
    expect(memo.goalAyahs({ kind: "sura", from: 112, to: 114 })).toHaveLength(4 + 5 + 6);
    expect(memo.goalAyahs({ kind: "juz", from: 30, to: 30 })[0]).toMatchObject({ s: 78, a: 1 });
    expect(memo.goalAyahs({ kind: "page", from: 1, to: 1 })).toHaveLength(7);
    expect(memo.goalAyahs(null)).toEqual([]);
  });

  it("should give today's dose: due reviews first, then fresh ayahs by perDay", async () => {
    const u = user();
    await memo.setGoal(u, { kind: "sura", from: 112, to: 112, perDay: 2 });
    let t = memo.today(await memo.get(u));
    expect(t).toMatchObject({ due: [], fresh: ["112:1", "112:2"], total: 4, started: 0 });
    await memo.review(u, 112, 1, true);
    await memo.review(u, 112, 2, false);
    const m = await memo.get(u);
    t = memo.today(m);
    expect(t.fresh).toEqual(["112:3", "112:4"]);
    expect(t.due).toEqual([]); // كلاهما موعده غداً
    expect(memo.today(m, Date.now() + 2 * 864e5).due.sort()).toEqual(["112:1", "112:2"]);
  });

  it("should move a correct ayah up the intervals and send a wrong one back to the start", async () => {
    const u = user();
    let it = await memo.review(u, 1, 1, true);
    expect(it.stage).toBe(0); // أول مرة: تعود غداً
    it = await memo.review(u, 1, 1, true);
    expect(it.stage).toBe(1);
    it = await memo.review(u, 1, 1, true);
    expect(it.stage).toBe(2);
    expect(Math.round((new Date(it.due) - Date.now()) / 864e5)).toBe(7);
    it = await memo.review(u, 1, 1, false);
    expect(it).toMatchObject({ stage: 0, lapses: 1, reps: 4 });
  });

  it("should map juz progress and log a tutoring session", async () => {
    const u = user();
    await memo.review(u, 114, 1, true); await memo.review(u, 114, 1, true); await memo.review(u, 114, 1, true);
    const o = await quran.overview(u);
    expect(o.juz[29]).toMatchObject({ juz: 30, started: 1, strong: 1 });
    expect(o.juz[0]).toMatchObject({ juz: 1, started: 0 });
    const sessions = await memo.logSession(u, "الشيخ أحمد", 12);
    expect(sessions[0]).toMatchObject({ with: "الشيخ أحمد", ayahs: 12 });
  });
});
