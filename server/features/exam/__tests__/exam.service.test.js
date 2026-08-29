import { describe, it, expect, beforeEach } from "vitest";
import * as exam from "../exam.service.js";
import ExamAttempt from "../exam.attempt.model.js";
import * as content from "../../content/content.service.js";
import User from "../../users/user.model.js";
import { bank, seedUnits, userWithRing1Done, answersFor, wrongAnswers } from "./exam.fixtures.js";

beforeEach(seedUnits);

describe("exam.service", () => {
  it("should not be eligible before ring 1 is complete", async () => {
    const user = await User.create({ name: "زيد", email: "z@example.com", password: "pass1234" });
    expect((await exam.status(user._id)).eligible).toBe(false);
    await expect(exam.start(user._id)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("should draw 40 questions only from the reserved examOnly pool", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions, total } = await exam.start(user._id);
    expect(attemptId).toHaveLength(24);
    expect(total).toBe(exam.EXAM_SIZE);
    expect(questions).toHaveLength(40);
    expect(questions.every((q) => q.a === undefined && q.examOnly === undefined && q.t !== "open")).toBe(true);
    // كل سؤال معروض محجوز فعلاً في ملف المحتوى الأصلي
    expect(questions.every((q) => bank.get(`${q.unitId}:${q.qid}`)?.examOnly === true)).toBe(true);
  });

  it("should keep the reserved pool out of practice quizzes and the unit endpoint", async () => {
    const unit = await content.getPublishedUnit("center-1");
    expect(unit.questions.length).toBeGreaterThan(10);
    expect(unit.questions.some((q) => q.examOnly)).toBe(false);
    expect(unit.questions.every((q) => bank.get(`center-1:${q.qid}`).examOnly !== true)).toBe(true);
    const quiz = await content.pickQuiz("center-1", 10);
    expect(quiz.questions.every((q) => bank.get(`center-1:${q.qid}`).examOnly !== true)).toBe(true);
  });

  it("should never serve a practice question in the exam", async () => {
    const user = await userWithRing1Done();
    const seen = new Set();
    for (let round = 0; round < 3; round++) {
      await ExamAttempt.deleteMany({});
      const { questions } = await exam.start(user._id);
      questions.forEach((q) => seen.add(`${q.unitId}:${q.qid}`));
    }
    expect([...seen].every((key) => bank.get(key).examOnly === true)).toBe(true);
    expect(seen.size).toBeGreaterThan(40);
  });

  it("should randomise question order and option order", async () => {
    const user = await userWithRing1Done();
    const orders = [], moved = [];
    for (let round = 0; round < 4; round++) {
      await ExamAttempt.deleteMany({});
      const { questions } = await exam.start(user._id);
      orders.push(questions.map((q) => `${q.unitId}:${q.qid}`).join(","));
      questions.forEach((q) => {
        const src = bank.get(`${q.unitId}:${q.qid}`);
        if (q.t === "mcq") moved.push(q.opts.join("|") !== src.opts.join("|"));
        if (q.t === "order") moved.push(q.items.join("|") !== src.items.join("|"));
      });
    }
    expect(new Set(orders).size).toBe(4);
    expect(moved.filter(Boolean).length).toBeGreaterThan(moved.length / 2);
  });

  it("should issue a certificate on a passing submission and reject a second exam", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await exam.submit(user._id, attemptId, answersFor(questions));
    expect(out.passed).toBe(true);
    expect(out.score).toBe(40);
    expect(out.certificate.code).toMatch(/^MDR-\d{4}-[A-Z0-9]{5}$/);
    expect(await exam.verify(out.certificate.code)).toMatchObject({ valid: true, name: "ليان", proctored: false });
    await expect(exam.start(user._id)).rejects.toMatchObject({ code: "ALREADY_CERTIFIED" });
  });

  it("should fail below 80% without issuing a certificate", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await exam.submit(user._id, attemptId, wrongAnswers(questions));
    expect(out.passed).toBe(false);
    expect(out.certificate).toBeNull();
    expect((await exam.verify("MDR-2026-ZZZZZ")).valid).toBe(false);
  });

  it("should reject an unknown or reused attempt", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    await exam.submit(user._id, attemptId, wrongAnswers(questions));
    await expect(exam.submit(user._id, attemptId, [])).rejects.toMatchObject({ statusCode: 404 });
  });
});
