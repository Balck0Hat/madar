import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as content from "../../content/content.service.js";
import * as quizAttempt from "../../quizAttempt/quizAttempt.service.js";
import * as reviews from "../../reviews/reviews.service.js";
import * as challenge from "../../challenge/challenge.service.js";
import Review from "../../reviews/review.model.js";
import { bank, seedUnits } from "./exam.fixtures.js";

const uid = () => new mongoose.Types.ObjectId();
const reserved = (unitId, qid) => bank.get(`${unitId}:${qid}`)?.examOnly === true;

beforeEach(seedUnits);

// بنك الامتحان محجوز: قيمته كلها في ألّا يكون المتعلم قد رآه.
// كل مسار يقرأ الأسئلة بـ lean() يتجاوز toPublic، فيحتاج ترشيحه الخاص — وهذه حراسة عليها جميعاً.
describe("reserved exam questions must not leak into any learner path", () => {
  it("should never serve a reserved question in a saved quiz attempt", async () => {
    const { questions } = await quizAttempt.startAttempt(uid(), "center-1", 10);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some((q) => reserved("center-1", q.qid))).toBe(false);
  });

  it("should never serve a reserved question in a practice quiz", async () => {
    const { questions } = await content.pickQuiz("center-1", 10);
    expect(questions.some((q) => reserved("center-1", q.qid))).toBe(false);
  });

  it("should never serve a reserved question in a due review", async () => {
    const user = uid();
    await reviews.schedule(user, "center-1");
    await Review.updateOne({ user, unitId: "center-1" }, { $set: { due: new Date(Date.now() - 1000) } });
    const { items } = await reviews.dueList(user);
    expect(items[0].questions.length).toBeGreaterThan(0);
    expect(items[0].questions.some((q) => reserved("center-1", q.qid))).toBe(false);
  });

  it("should never serve a reserved question as the daily challenge", async () => {
    // أيام كثيرة: سؤال اليوم مشتق من التاريخ، فيوم واحد لا يثبت شيئاً
    for (let day = 1; day <= 40; day++) {
      const out = await challenge.questionOfDay(`2026-01-${String(day).padStart(2, "0")}`);
      expect(out?.question).toBeTruthy();
      expect(reserved(out.unitId, out.question.qid)).toBe(false);
    }
  });
});
