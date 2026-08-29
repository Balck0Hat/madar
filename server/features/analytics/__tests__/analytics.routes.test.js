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
const register = async (name, email) => cookiesOf(await request(app).post("/api/v1/auth/register").send({ name, email, password: "pass1234" }));
const asAdmin = () => register("مشرف", env.adminEmails[0] || "admin@example.com");
const asUser = () => register("زائر", "visitor@example.com");

describe("analytics routes", () => {
  it("should require a session to report an event and validate its shape", async () => {
    expect((await request(app).post("/api/v1/analytics/event").send({ unitId: "center-1", kind: "open" })).status).toBe(401);
    const user = await asUser();
    const ok = await request(app).post("/api/v1/analytics/event").set("Cookie", user).send({ unitId: "center-1", kind: "page", page: 2 });
    expect(ok.status).toBe(200);
    expect(ok.body.data.recorded).toBe(true);
    // نفس الصفحة مرة أخرى: تُبتلع بلا خطأ
    expect((await request(app).post("/api/v1/analytics/event").set("Cookie", user).send({ unitId: "center-1", kind: "page", page: 2 })).body.data.recorded).toBe(false);
    for (const bad of [{ unitId: "nope", kind: "open" }, { unitId: "center-1", kind: "scroll" }, { unitId: "center-1", kind: "page" }]) {
      expect((await request(app).post("/api/v1/analytics/event").set("Cookie", user).send(bad)).status).toBe(400);
    }
  });

  it("should keep the funnel and hard questions for admins only", async () => {
    const user = await asUser();
    expect((await request(app).get("/api/v1/analytics/funnel").set("Cookie", user)).status).toBe(403);
    expect((await request(app).get("/api/v1/analytics/hard-questions").set("Cookie", user)).status).toBe(403);
    await request(app).post("/api/v1/analytics/event").set("Cookie", user).send({ unitId: "center-1", kind: "open" });

    const admin = await asAdmin();
    const funnel = await request(app).get("/api/v1/analytics/funnel").set("Cookie", admin);
    expect(funnel.status).toBe(200);
    expect(funnel.body.data.units[0]).toMatchObject({ unitId: "center-1", opens: 1, finishes: 0 });
    const hard = await request(app).get("/api/v1/analytics/hard-questions?min=1").set("Cookie", admin);
    expect(hard.status).toBe(200);
    expect(hard.body.data).toMatchObject({ minAsked: 1, units: [] });
  });
});
