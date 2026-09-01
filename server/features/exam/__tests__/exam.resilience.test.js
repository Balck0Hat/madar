import { describe, it, expect, beforeEach } from "vitest";
import * as exam from "../exam.service.js";
import ExamSession from "../exam.session.model.js";
import ExamAttempt from "../exam.attempt.model.js";
import { domainOf } from "../exam.pool.js";
import { seedUnits, userWithRing1Done, answersFor, wrongAnswers, answerAll } from "./exam.fixtures.js";

beforeEach(seedUnits);

// كانت المحاولة تعيش في Map داخل ذاكرة العملية: أي نشر يمحوها، والتبريد
// مسجَّل من لحظة البدء، فيخسر المتعلّم محاولته ثلاثين يوماً بلا ذنب.
describe("an attempt must survive a server restart", () => {
  it("should keep the questions and answers in the database, not in memory", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    await exam.saveAnswer(user._id, attemptId, answersFor(questions)[0]);

    const stored = await ExamSession.findOne({ user: user._id }).lean();
    expect(stored.attemptId).toBe(attemptId);
    expect(stored.questions).toHaveLength(exam.EXAM_SIZE);
    expect(stored.answers).toHaveLength(1);
  });

  it("should still grade an attempt whose answers were saved one by one", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    await answerAll(exam, user._id, attemptId, answersFor(questions));
    const out = await exam.submit(user._id, attemptId);
    expect(out.score).toBe(exam.EXAM_SIZE);
    expect(out.passed).toBe(true);
  });

  it("should overwrite an answer when the learner goes back and changes it", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const right = answersFor(questions)[0];
    await exam.saveAnswer(user._id, attemptId, { ...right, answer: "غلط" });
    await exam.saveAnswer(user._id, attemptId, right);
    const stored = await ExamSession.findOne({ user: user._id }).lean();
    expect(stored.answers).toHaveLength(1);
    const out = await exam.submit(user._id, attemptId);
    expect(out.score).toBe(1);
  });

  it("should refuse an answer for a question outside the attempt", async () => {
    const user = await userWithRing1Done();
    const { attemptId } = await exam.start(user._id);
    await expect(exam.saveAnswer(user._id, attemptId, { unitId: "center-1", qid: "nope", answer: 1 }))
      .rejects.toMatchObject({ code: "NOT_IN_ATTEMPT" });
  });
});

// كان انتهاء الوقت يلغي المحاولة كلها: بلا علامة، ومع تبريد ثلاثين يوماً.
// عقوبتان على تأخّر واحد. الآن يُصحَّح ما حُفظ قبل المهلة.
describe("running out of time", () => {
  const expire = (user) => ExamSession.updateOne({ user: user._id }, { $set: { deadline: new Date(Date.now() - 1000) } });

  it("should grade what was answered before the deadline", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const correct = answersFor(questions);
    for (const a of correct.slice(0, 10)) await exam.saveAnswer(user._id, attemptId, a);
    await expire(user);

    const out = await exam.submit(user._id, attemptId);
    expect(out.expired).toBe(true);
    expect(out.score).toBe(10);
    expect(out.total).toBe(exam.EXAM_SIZE);
    expect(out.passed).toBe(false);
  });

  it("should refuse answers that arrive after the deadline", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    await expire(user);
    await expect(exam.saveAnswer(user._id, attemptId, answersFor(questions)[0]))
      .rejects.toMatchObject({ code: "EXAM_EXPIRED" });
  });

  it("should not offer an expired attempt for resuming", async () => {
    const user = await userWithRing1Done();
    await exam.start(user._id);
    await expire(user);
    expect((await exam.status(user._id)).resumable).toBeNull();
  });
});

// شهادة «إتمام المدار الأول» لا يصحّ أن تُمنح على امتحان لم يمسّ نصف الخريطة.
// السحب الحرّ كان يترك مجالاً كاملاً بلا سؤال في 88.7% من الامتحانات.
describe("domain coverage", () => {
  it("should draw from every domain in the learner's ring", async () => {
    const user = await userWithRing1Done();
    for (let round = 0; round < 5; round++) {
      await ExamAttempt.deleteMany({});
      await ExamSession.deleteMany({});
      const { questions } = await exam.start(user._id);
      expect(questions).toHaveLength(exam.EXAM_SIZE);
      // عشرة مجالات والمركز
      expect(new Set(questions.map((q) => domainOf(q.unitId))).size).toBe(11);
    }
  });
});

// المفتاح كان يُرسل للأربعين في الحالتين والواجهة لا تقرؤه: تسريب بلا فائدة.
// والراسب يُمتحن من البنك نفسه بعد ثلاثين يوماً.
describe("what the learner is told afterwards", () => {
  it("should give a failing learner a domain map but no answer key", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await answerAll(exam, user._id, attemptId, wrongAnswers(questions)).then(() => exam.submit(user._id, attemptId));

    expect(out.passed).toBe(false);
    expect(out.review).toBeNull();
    expect(JSON.stringify(out)).not.toContain('"why"');
    expect(Object.keys(out.domains)).toHaveLength(11);
    expect(Object.values(out.domains).reduce((s, d) => s + d.total, 0)).toBe(exam.EXAM_SIZE);
  });

  it("should give a passing learner the full review", async () => {
    const user = await userWithRing1Done();
    const { attemptId, questions } = await exam.start(user._id);
    const out = await answerAll(exam, user._id, attemptId, answersFor(questions)).then(() => exam.submit(user._id, attemptId));

    expect(out.passed).toBe(true);
    expect(out.review).toHaveLength(exam.EXAM_SIZE);
    expect(out.review.every((g) => g.q && g.ok === true)).toBe(true);
  });
});

// من نال 32 من 40 لم يكن يملك سبيلاً إلى تحسينها أبداً
describe("retaking to improve", () => {
  it("should keep the same certificate code and raise only a better score", async () => {
    const user = await userWithRing1Done();
    const first = await exam.start(user._id);
    const answers = answersFor(first.questions);
    for (const a of answers.slice(0, 36)) await exam.saveAnswer(user._id, first.attemptId, a);
    const one = await exam.submit(user._id, first.attemptId);
    expect(one.score).toBe(36);

    await ExamAttempt.updateOne({ user: user._id }, { $set: { lastAttemptAt: new Date(Date.now() - 31 * 864e5) } });
    const second = await exam.start(user._id);
    await answerAll(exam, user._id, second.attemptId, answersFor(second.questions));
    const two = await exam.submit(user._id, second.attemptId);

    expect(two.score).toBe(40);
    expect(two.certificate.code).toBe(one.certificate.code);
    expect(two.certificate.score).toBe(40);
  });
});
