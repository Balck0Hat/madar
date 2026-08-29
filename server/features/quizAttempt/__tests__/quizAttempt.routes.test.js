import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../../../app.js";
import QuizAttempt, { ATTEMPT_TTL_SECONDS } from "../quizAttempt.model.js";
import { ATTEMPT_TTL_MS } from "../quizAttempt.service.js";
import { bus } from "../../../shared/utils/events.js";

let app;
beforeAll(async () => { app = await createApp(); });

const cookiesOf = (res) => (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const asUser = async (email) => cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "متعلم", email, password: "pass1234" }));
const meId = async (cookie) => (await request(app).get("/api/v1/users/me").set("Cookie", cookie)).body.data.user.id;

// بنك واسع كي يكون تطابق سحبتين متتاليتين دليلاً على الاستئناف لا على المصادفة
const bank = Array.from({ length: 24 }, (_, i) => ({ qid: `q${i + 1}`, t: "mcq", q: `سؤال ${i + 1}؟`, opts: ["أ", "ب", "ج", "د"], a: i % 4, why: "لأن هذا هو الجواب." }));
const seedUnit = (unitId = "earth-1-1") => mongoose.models.Unit.create({ unitId, title: "وحدة اختبار", cards: [], questions: bank, published: true });

const start = (cookie, unitId = "earth-1-1", n = 10) => request(app).post(`/api/v1/quiz-attempts/${unitId}/start?n=${n}`).set("Cookie", cookie);
const qids = (res) => res.body.data.questions.map((q) => q.qid);

const until = async (fn, ms = 5000) => {
  const stop = Date.now() + ms;
  for (;;) { if (await fn()) return true; if (Date.now() > stop) return false; await new Promise((r) => setTimeout(r, 50)); }
};

beforeEach(async () => { await seedUnit(); });

describe("quiz attempt routes", () => {
  it("should require auth on start and on answering", async () => {
    expect((await request(app).post("/api/v1/quiz-attempts/earth-1-1/start")).status).toBe(401);
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").send({ qid: "q1" })).status).toBe(401);
  });

  it("should draw the asked-for number of questions and store the attempt", async () => {
    const user = await asUser("draw@example.com");
    const res = await start(user, "earth-1-1", 10);
    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(10);
    expect(res.body.data.answers).toEqual([]);
    expect(await QuizAttempt.countDocuments({})).toBe(1);
  });

  it("should return the same questions on a reload instead of re-drawing an easier set", async () => {
    const user = await asUser("resume@example.com");
    const first = await start(user);
    const again = await start(user);
    expect(qids(again)).toEqual(qids(first));
    expect(await QuizAttempt.countDocuments({})).toBe(1);
  });

  it("should record an answer and hand it back when the attempt is resumed", async () => {
    const user = await asUser("answer@example.com");
    const [qid] = qids(await start(user));
    const saved = await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid, answer: 2 });
    expect(saved.status).toBe(200);
    expect(saved.body.data.answered).toBe(1);
    // إجابة ثانية على السؤال نفسه تُحدِّث ولا تُضيف
    await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid, answer: 3, selfMark: "unclear" });
    const resumed = await start(user);
    expect(resumed.body.data.answers).toEqual([{ qid, answer: 3, selfMark: "unclear" }]);
  });

  it("should reject a bad unit, an unknown qid, an unknown self mark and a missing attempt", async () => {
    const user = await asUser("bad@example.com");
    expect((await start(user, "nope-9-9")).status).toBe(400);
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid: "q1" })).status).toBe(404);
    await start(user);
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid: "ghost" })).status).toBe(400);
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid: "q1", selfMark: "maybe" })).status).toBe(400);
  });

  it("should refuse to start an attempt on a locked unit", async () => {
    const user = await asUser("locked@example.com");
    await seedUnit("earth-2-1");
    const res = await start(user, "earth-2-1");
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("UNIT_LOCKED");
    expect(await QuizAttempt.countDocuments({})).toBe(0);
  });

  it("should carry a TTL index so an abandoned attempt expires after 24h", async () => {
    const idx = await QuizAttempt.collection.indexes();
    const ttl = idx.find((i) => i.expireAfterSeconds !== undefined);
    expect(ttl.expireAfterSeconds).toBe(ATTEMPT_TTL_SECONDS);
    expect(ATTEMPT_TTL_SECONDS).toBe(24 * 60 * 60);
    expect(idx.some((i) => i.unique && i.key.user === 1 && i.key.unitId === 1)).toBe(true);
  });

  it("should drop an attempt older than the TTL and draw a fresh one", async () => {
    const user = await asUser("stale@example.com");
    const first = await start(user);
    const old = new Date(Date.now() - ATTEMPT_TTL_MS - 1000);
    await QuizAttempt.updateOne({ unitId: "earth-1-1" }, { $set: { startedAt: old, answers: [{ qid: qids(first)[0], answer: 1 }] } });
    // المحاولة الميتة لا تقبل إجابة ولا تُستأنف
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", user).send({ qid: qids(first)[0], answer: 1 })).status).toBe(404);
    const fresh = await start(user);
    expect(fresh.status).toBe(200);
    expect(fresh.body.data.answers).toEqual([]);
    expect(new Date(fresh.body.data.startedAt).getTime()).toBeGreaterThan(old.getTime());
    expect(await QuizAttempt.countDocuments({})).toBe(1);
  });

  it("should delete the attempt once the unit is finished", async () => {
    const user = await asUser("done@example.com");
    await start(user);
    bus.emit("unit.finished", { userId: await meId(user), unitId: "earth-1-1" });
    expect(await until(async () => (await QuizAttempt.countDocuments({})) === 0)).toBe(true);
  });

  it("should keep one learner's attempt invisible to another", async () => {
    const mine = await asUser("mine@example.com");
    const other = await asUser("other@example.com");
    const first = await start(mine);
    const theirs = await start(other);
    expect(await QuizAttempt.countDocuments({})).toBe(2);
    expect((await request(app).patch("/api/v1/quiz-attempts/earth-1-1").set("Cookie", other).send({ qid: qids(first)[0], answer: 1 })).status).toBe(
      qids(theirs).includes(qids(first)[0]) ? 200 : 400,
    );
  });
});
