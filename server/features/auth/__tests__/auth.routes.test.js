import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../../../app.js";

let app;
beforeAll(async () => { app = await createApp(); });

const creds = { name: "زيد", email: "zaid@example.com", password: "secret12" };
const cookiesOf = (res) => (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");

describe("POST /api/v1/auth/register", () => {
  it("should return 201, the user, and set httpOnly cookies", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(creds);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { user: { email: "zaid@example.com" } } });
    const setCookie = res.headers["set-cookie"].join("\n");
    expect(setCookie).toMatch(/madar_access=.*HttpOnly/);
    expect(setCookie).toMatch(/madar_refresh=.*HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Strict/);
  });

  it("should return 400 with field errors on a weak password", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({ ...creds, password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.password).toBeTruthy();
  });

  it("should return 409 on a duplicate email", async () => {
    await request(app).post("/api/v1/auth/register").send(creds);
    const res = await request(app).post("/api/v1/auth/register").send(creds);
    expect(res.status).toBe(409);
  });
});

describe("protected routes", () => {
  it("should return 401 without cookies", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return the user and progress with valid cookies", async () => {
    const reg = await request(app).post("/api/v1/auth/register").send(creds);
    const cookie = cookiesOf(reg);
    const me = await request(app).get("/api/v1/users/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
    expect(me.body.data.user.name).toBe("زيد");
    const prog = await request(app).get("/api/v1/progress").set("Cookie", cookie);
    expect(prog.status).toBe(200);
    expect(prog.body.data.state.xp).toBe(0);
  });

  it("should finish a unit and update settings", async () => {
    const cookie = cookiesOf(await request(app).post("/api/v1/auth/register").send(creds));
    const fin = await request(app).post("/api/v1/progress/units/center-1/finish").set("Cookie", cookie).send({ correct: 5, total: 5 });
    expect(fin.status).toBe(200);
    expect(fin.body.data.result.gain).toBe(110);
    const bad = await request(app).post("/api/v1/progress/units/center-1/finish").set("Cookie", cookie).send({ correct: 9, total: 5 });
    expect(bad.status).toBe(400);
    const patch = await request(app).patch("/api/v1/users/me").set("Cookie", cookie).send({ minutes: 60, fav: "earth", arabicNums: true });
    expect(patch.status).toBe(200);
    expect(patch.body.data.user.settings).toMatchObject({ minutes: 60, fav: "earth", arabicNums: true });
  });
});

describe("refresh and logout", () => {
  it("should rotate cookies on refresh and clear them on logout", async () => {
    const reg = await request(app).post("/api/v1/auth/register").send(creds);
    const first = cookiesOf(reg);
    const ref = await request(app).post("/api/v1/auth/refresh").set("Cookie", first);
    expect(ref.status).toBe(200);
    const second = cookiesOf(ref);
    expect(second).not.toBe(first);
    const out = await request(app).post("/api/v1/auth/logout").set("Cookie", second);
    expect(out.status).toBe(204);
    const again = await request(app).post("/api/v1/auth/refresh").set("Cookie", second);
    expect(again.status).toBe(401);
  });

  it("should return 401 on refresh without a cookie", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });
});

describe("unknown API route", () => {
  it("should return a JSON 404", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
