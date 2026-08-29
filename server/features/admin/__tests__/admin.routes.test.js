import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../../app.js";
import * as content from "../../content/content.service.js";
import { SEED_UNITS } from "../../../shared/data/seed/index.js";
import { env } from "../../../shared/config/env.js";

let app;
beforeAll(async () => { app = await createApp(); });
beforeEach(async () => { await content.seedUnits(SEED_UNITS); });

const cookiesOf = (res) => (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const adminEmail = env.adminEmails[0] || "admin@example.com";
const asAdmin = async () => cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "مشرف", email: adminEmail, password: "pass1234" }));
const asUser = async () => cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "زائر", email: "visitor@example.com", password: "pass1234" }));

describe("admin routes", () => {
  it("should forbid non-admins and allow admins", async () => {
    const user = await asUser();
    expect((await request(app).get("/api/v1/admin/overview").set("Cookie", user)).status).toBe(403);
    const admin = await asAdmin();
    const res = await request(app).get("/api/v1/admin/overview").set("Cookie", admin);
    expect(res.status).toBe(200);
    expect(res.body.data.published).toBe(SEED_UNITS.length);
    expect(res.body.data.integrations).toHaveProperty("ai");
  });

  it("should validate and upsert a unit, then serve it publicly once published", async () => {
    const admin = await asAdmin();
    const bad = await request(app).put("/api/v1/admin/units/earth-2-2").set("Cookie", admin).send({ title: "x", questions: [{ qid: "q1", t: "mcq", q: "سؤال؟", opts: ["أ"], a: 5 }] });
    expect(bad.status).toBe(400);
    const body = { title: "الأرض تتحرك", spark: "لماذا يتعاقب الليل والنهار؟", cards: [{ h: "الدوران", p: "تدور الأرض حول محورها." }], summary: ["الأرض تدور."], questions: [{ qid: "q1", t: "tf", q: "الأرض تدور حول محورها.", a: true, why: "نعم." }], published: true };
    const ok = await request(app).put("/api/v1/admin/units/earth-2-2").set("Cookie", admin).send(body);
    expect(ok.status).toBe(200);
    const pub = await request(app).get("/api/v1/content/units/earth-2-2");
    expect(pub.status).toBe(200);
    expect(pub.body.data.unit.title).toBe("الأرض تتحرك");
  });
});

describe("server-side quiz grading", () => {
  it("should grade submitted answers from the bank and pay XP accordingly", async () => {
    const user = await asUser();
    const quiz = await request(app).get("/api/v1/content/units/center-1/quiz?n=5").set("Cookie", user);
    expect(quiz.status).toBe(200);
    expect(quiz.body.data.questions).toHaveLength(5);
    const answers = quiz.body.data.questions.map((q) => ({ qid: q.qid, answer: q.t === "open" ? "لأن الاسترجاع يثبت المعلومة في الذاكرة" : q.a }));
    const fin = await request(app).post("/api/v1/progress/units/center-1/finish").set("Cookie", user).send({ answers });
    expect(fin.status).toBe(200);
    expect(fin.body.data.result.correct).toBe(5);
    expect(fin.body.data.result.graded).toHaveLength(5);
    expect(fin.body.data.result.gain).toBe(110);
  });

  it("should reject a finish with neither answers nor counts", async () => {
    const user = await asUser();
    const res = await request(app).post("/api/v1/progress/units/center-1/finish").set("Cookie", user).send({});
    expect(res.status).toBe(400);
  });

  it("should expose a public profile and certificate verification without auth", async () => {
    const reg = await request(app).post("/api/v1/auth/register").send({ name: "نور", email: "noor@example.com", password: "pass1234" });
    const handle = reg.body.data.user.handle;
    const prof = await request(app).get(`/api/v1/public/users/${encodeURIComponent(handle)}`);
    expect(prof.status).toBe(200);
    expect(prof.body.data.profile).toMatchObject({ name: "نور", xp: 0 });
    expect(prof.body.data.profile.email).toBeUndefined();
    expect((await request(app).get("/api/v1/exam/verify/MDR-2026-ABCDE")).body.data.valid).toBe(false);
    expect((await request(app).get("/api/v1/exam/verify/bad")).status).toBe(400);
  });
});
