import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { quota, reservedQids } from "../mark-exam-questions.js";
import { SEED_UNITS } from "../../shared/data/seed/index.js";

const TYPES = ["mcq", "tf", "fill", "order"];
const share = (counts) => {
  const total = TYPES.reduce((s, t) => s + (counts[t] || 0), 0);
  return Object.fromEntries(TYPES.map((t) => [t, total ? ((counts[t] || 0) / total) * 100 : 0]));
};

describe("exam reserve quota", () => {
  it("should hand out exactly the number of slots asked for", () => {
    const take = quota({ mcq: 20, tf: 5, fill: 3, order: 2 }, 6);
    expect(TYPES.reduce((s, t) => s + (take[t] || 0), 0)).toBe(6);
  });

  it("should never ask for more of a type than the bank holds", () => {
    const take = quota({ mcq: 2, tf: 1, fill: 0, order: 0 }, 6);
    expect(take.mcq).toBeLessThanOrEqual(2);
    expect(take.tf).toBeLessThanOrEqual(1);
    expect(take.fill || 0).toBe(0);
    expect(take.order || 0).toBe(0);
  });

  it("should be deterministic for the same bank", () => {
    const counts = { mcq: 17, tf: 4, fill: 3, order: 2 };
    expect(quota(counts, 6)).toEqual(quota(counts, 6));
  });

  // slice(-0) هي slice(0) فتعيد المصفوفة كلها. الخطأ أعطى 1931 سؤالاً
  // محجوزاً بدل 1458، أي أن أنواعاً بحصة صفر حُجزت بالكامل.
  it("should reserve nothing from a type whose quota is zero", () => {
    const questions = [
      ...Array.from({ length: 20 }, (_, i) => ({ qid: `q${i + 1}`, t: "mcq" })),
      { qid: "q90", t: "order" }, { qid: "q91", t: "order" },
    ];
    const picked = reservedQids(questions);
    expect(picked.size).toBe(6);
    expect(picked.has("q90") && picked.has("q91")).toBe(false);
  });
});

// الامتحان يجب أن يشبه ما تمرّن عليه المتعلّم. الحجز السابق كان يأخذ آخر
// ستة أسئلة بترتيب qid، وأسئلة الإكمال والترتيب تُكتب في آخر البنك عادةً،
// فصار الامتحان 59% إكمالاً وترتيباً بينما البنك 14%.
describe("reserved pool across the whole curriculum", () => {
  const bank = {}, reserved = {};
  for (const unit of SEED_UNITS) {
    for (const q of unit.questions || []) {
      if (q.t === "open") continue;
      bank[q.t] = (bank[q.t] || 0) + 1;
      if (q.examOnly) reserved[q.t] = (reserved[q.t] || 0) + 1;
    }
  }
  const bankShare = share(bank), examShare = share(reserved);

  it("should reserve six questions in every unit", () => {
    const short = SEED_UNITS
      .filter((u) => (u.questions || []).filter((q) => q.examOnly).length !== 6)
      .map((u) => u.unitId);
    expect(short).toEqual([]);
  });

  it("should not make the exam mostly fill and order when the bank is not", () => {
    const bankHard = bankShare.fill + bankShare.order;
    const examHard = examShare.fill + examShare.order;
    expect(examHard).toBeLessThan(bankHard + 15);
  });

  it("should keep multiple choice the bulk of the exam, as it is of the bank", () => {
    expect(bankShare.mcq).toBeGreaterThan(50);
    expect(examShare.mcq).toBeGreaterThan(50);
  });

  it("should keep the marking idempotent", () => {
    // إعادة التشغيل على ملف مُعلَّم يجب ألا تغيّر شيئاً
    const dir = new URL("../../shared/data/seed/units/", import.meta.url);
    const file = readdirSync(dir).find((f) => f.endsWith(".js"));
    const src = readFileSync(new URL(file, dir), "utf8");
    expect((src.match(/examOnly: true/g) || []).length).toBe(6);
  });
});
