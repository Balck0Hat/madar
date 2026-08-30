import { describe, it, expect, beforeEach } from "vitest";
import * as challenge from "../challenge.service.js";
import * as content from "../../content/content.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

const days = (from, count) =>
  Array.from({ length: count }, (_, i) => new Date(Date.parse(`${from}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10));

const inPool = (id) => id.startsWith("center") || id.split("-")[1] === "1";

// يوم يقع على حدّ دورة (رقمه يقبل القسمة على حجم البركة)
const dayNumber = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / 86400000);
const CYCLE_START = days("2026-01-01", 200).find((d) => dayNumber(d) % 83 === 0);
const nextCycle = (d) => days(d, 84)[83];

describe("daily challenge pool", () => {
  it("should draw only from the centre and ring one", async () => {
    // التحدي مشترك بين الجميع، والمبتدئ لا يُسأل عن مادة لم يبلغها
    const picked = [];
    for (const day of days("2026-03-01", 40)) picked.push((await challenge.questionOfDay(day)).unitId);
    expect(picked.every(inPool)).toBe(true);
  });

  it("should give the same question to everyone on the same day", async () => {
    const a = await challenge.questionOfDay("2026-05-14");
    const b = await challenge.questionOfDay("2026-05-14");
    expect(b.unitId).toBe(a.unitId);
    expect(b.question.qid).toBe(a.question.qid);
  });

  it("should use every unit exactly once within a cycle", async () => {
    // الضمان داخل الدورة لا عبر نافذة اعتباطية، فالنافذة هنا تبدأ عند حدّ دورة.
    // القسمة على بصمة رقمية كانت تُكتّل الاختيار: وحدات تتكرر وعشرات لا تظهر أبداً.
    const picked = [];
    for (const day of days(CYCLE_START, 83)) picked.push((await challenge.questionOfDay(day)).unitId);
    expect(new Set(picked).size).toBe(83);
  });

  it("should reorder the next cycle rather than repeat the last one", async () => {
    const first = [];
    for (const day of days(CYCLE_START, 83)) first.push((await challenge.questionOfDay(day)).unitId);
    const second = [];
    for (const day of days(nextCycle(CYCLE_START), 83)) second.push((await challenge.questionOfDay(day)).unitId);
    expect(new Set(second).size).toBe(83);
    expect(second).not.toEqual(first);
  });

  it("should never serve an open or reserved exam question", async () => {
    for (const day of days("2026-07-01", 20)) {
      const { question } = await challenge.questionOfDay(day);
      expect(question.t).not.toBe("open");
      expect(question.examOnly).not.toBe(true);
    }
  });
});
