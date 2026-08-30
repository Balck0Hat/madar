import { describe, it, expect, beforeAll, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../../app.js";
import User from "../../users/user.model.js";
import { env } from "../../../shared/config/env.js";
import * as authService from "../auth.service.js";

// الإغلاق يُبدَّل هنا لأن env تُقرأ مرة واحدة عند التحميل
let app;
beforeAll(async () => { app = await createApp(); });

const closed = () => { env.registrationOpen = false; };
afterEach(() => { env.registrationOpen = true; });

describe("closed registration", () => {
  it("should refuse a new account with 403 and create nothing", async () => {
    closed();
    const res = await request(app).post("/api/v1/auth/register").send({ name: "زيد", email: "z@example.com", password: "pass1234" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("REGISTRATION_CLOSED");
    expect(res.headers["set-cookie"]).toBeUndefined();
    expect(await User.countDocuments()).toBe(0);
  });

  it("should still let an existing account log in", async () => {
    await authService.register({ name: "ليان", email: "l@example.com", password: "pass1234" });
    closed();
    const res = await request(app).post("/api/v1/auth/login").send({ email: "l@example.com", password: "pass1234" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe("ليان");
  });

  it("should refuse a first-time Google sign-in but admit a returning one", async () => {
    await authService.register({ name: "سارة", email: "s@example.com", password: "pass1234" });
    closed();
    // حساب خارجي جديد طريق تسجيل آخر، فيُغلق معه
    await expect(authService.loginWithProvider("google", { email: "new@example.com", name: "جديد" }))
      .rejects.toMatchObject({ statusCode: 403, code: "REGISTRATION_CLOSED" });
    expect(await User.countDocuments()).toBe(1);
    // بريد معروف سلفاً ليس تسجيلاً بل ربطاً، فيمرّ
    const { user, isNew } = await authService.loginWithProvider("google", { email: "s@example.com", name: "سارة" });
    expect(isNew).toBe(false);
    expect(user.email).toBe("s@example.com");
  });

  it("should tell the client the door is shut", async () => {
    closed();
    const res = await request(app).get("/api/v1/auth/providers");
    expect(res.body.data.registrationOpen).toBe(false);
    const open = await request(app).get("/api/v1/auth/providers");
    env.registrationOpen = true;
    expect((await request(app).get("/api/v1/auth/providers")).body.data.registrationOpen).toBe(true);
    expect(open.body.data.registrationOpen).toBe(false);
  });
});
