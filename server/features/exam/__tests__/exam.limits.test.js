import { describe, it, expect, beforeEach } from "vitest";
import * as exam from "../exam.service.js";
import ExamAttempt from "../exam.attempt.model.js";
import { seedUnits, userWithRing1Done, answersFor, wrongAnswers } from "./exam.fixtures.js";

beforeEach(seedUnits);

// حدّان يجعلان الامتحان امتحاناً: مهلة تُنهيه، وتبريد يمنع تكراره حتى يُحفظ
describe("exam limits", () => {
  it("should reject a submission after the 45-minute limit", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions, minutes, endsAt } = await exam.start(user._id);
    expect(minutes).toBe(exam.EXAM_MINUTES);
    expect(new Date(endsAt).getTime()).toBeGreaterThan(Date.now());
    // نُقدّم الساعة بدل انتظار 45 دقيقة حقيقية
    const realNow = Date.now, late = Date.now() + (exam.EXAM_MINUTES + 1) * 60 * 1000;
    Date.now = () => late;
    try {
      const err = await exam.submit(user._id, attemptId, answersFor(questions)).catch((e) => e);
      expect(err).toMatchObject({ code: "EXAM_EXPIRED", statusCode: 400 });
      expect(err.message).toContain("انتهت مهلة الامتحان");
    } finally {
      Date.now = realNow;
    }
  });

  it("should accept a submission just inside the limit", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const realNow = Date.now, almost = Date.now() + exam.EXAM_MINUTES * 60 * 1000 - 1000;
    Date.now = () => almost;
    try {
      const out = await exam.submit(user._id, attemptId, answersFor(questions));
      expect(out.passed).toBe(true);
    } finally {
      Date.now = realNow;
    }
  });

  it("should refuse a new attempt within 30 days and name the reopening date", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await exam.submit(user._id, attemptId, wrongAnswers(questions));
    expect(out.passed).toBe(false);
    expect(new Date(out.reopensAt).getTime()).toBeGreaterThan(Date.now());
    const err = await exam.start(user._id).catch((e) => e);
    expect(err).toMatchObject({ code: "EXAM_COOLDOWN", statusCode: 403 });
    expect(err.message).toContain(String(exam.COOLDOWN_DAYS));
    expect((await exam.status(user._id)).reopensAt).toBeInstanceOf(Date);
  });

  it("should lock an abandoned attempt too, so questions cannot be previewed and dropped", async () => {
    const user = await userWithRing1Done();
    await exam.start(user._id);
    await expect(exam.start(user._id)).rejects.toMatchObject({ code: "EXAM_COOLDOWN" });
  });

  it("should reopen the exam once the 30 days have passed", async () => {
    const user = await userWithRing1Done();
    const first = await exam.start(user._id);
    await exam.submit(user._id, first.attemptId, wrongAnswers(first.questions));
    const past = new Date(Date.now() - (exam.COOLDOWN_DAYS + 1) * 24 * 3600 * 1000);
    await ExamAttempt.updateOne({ user: user._id }, { $set: { lastAttemptAt: past } });
    expect((await exam.status(user._id)).reopensAt).toBeNull();
    const again = await exam.start(user._id);
    expect(again.questions).toHaveLength(exam.EXAM_SIZE);
  });
});
