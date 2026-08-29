import { describe, it, expect, beforeEach } from "vitest";
import * as exam from "../exam.service.js";
import * as content from "../../content/content.service.js";
import User from "../../users/user.model.js";
import Progress from "../../progress/progress.model.js";
import { DOMAIN_IDS } from "../../../shared/data/curriculum.js";
import { uid } from "../../../shared/utils/units.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";

const ring1 = () => {
  const ids = ["center-1", "center-2", "center-3"];
  DOMAIN_IDS.forEach((d) => { for (let i = 0; i < 8; i++) ids.push(uid(d, 0, i)); });
  return ids;
};

async function userWithRing1Done() {
  const user = await User.create({ name: "ليان", email: "layan@example.com", password: "pass1234" });
  const progress = new Map(ring1().map((id) => [id, { score: 10, total: 10, perfect: false, sim: true }]));
  await Progress.create({ user: user._id, progress });
  return user;
}

beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

describe("exam.service", () => {
  it("should not be eligible before ring 1 is complete", async () => {
    const user = await User.create({ name: "زيد", email: "z@example.com", password: "pass1234" });
    expect((await exam.status(user._id)).eligible).toBe(false);
    await expect(exam.start(user._id)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("should start an attempt with closed questions stripped of answers", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    expect(attemptId).toHaveLength(24);
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(questions.every((q) => q.a === undefined && q.t !== "open")).toBe(true);
  });

  it("should issue a certificate on a passing submission and reject a second exam", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const bank = new Map();
    for (const u of SEED_UNITS) u.questions.forEach((q) => bank.set(`${u.unitId}:${q.qid}`, q.a));
    const answers = questions.map((q) => ({ unitId: q.unitId, qid: q.qid, answer: bank.get(`${q.unitId}:${q.qid}`) }));
    const out = await exam.submit(user._id, attemptId, answers);
    expect(out.passed).toBe(true);
    expect(out.certificate.code).toMatch(/^MDR-\d{4}-[A-Z0-9]{5}$/);
    expect((await exam.verify(out.certificate.code))).toMatchObject({ valid: true, name: "ليان" });
    await expect(exam.start(user._id)).rejects.toMatchObject({ code: "ALREADY_CERTIFIED" });
  });

  it("should fail below 80% without issuing a certificate", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await exam.submit(user._id, attemptId, questions.map((q) => ({ unitId: q.unitId, qid: q.qid, answer: "wrong" })));
    expect(out.passed).toBe(false);
    expect(out.certificate).toBeNull();
    expect((await exam.verify("MDR-2026-ZZZZZ")).valid).toBe(false);
  });

  it("should reject an unknown or reused attempt", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    await exam.submit(user._id, attemptId, questions.map((q) => ({ unitId: q.unitId, qid: q.qid, answer: "x" })));
    await expect(exam.submit(user._id, attemptId, [])).rejects.toMatchObject({ statusCode: 404 });
  });
});
