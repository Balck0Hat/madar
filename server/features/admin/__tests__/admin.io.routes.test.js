import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../../../app.js";
import { env } from "../../../shared/config/env.js";
import { validUnit } from "./unit.fixture.js";

let app;
beforeAll(async () => { app = await createApp(); });

const cookiesOf = (res) => (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const adminEmail = env.adminEmails[0] || "admin@example.com";
const asAdmin = async () => cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "مشرف", email: adminEmail, password: "pass1234" }));

// الاستيراد يُرسل نصاً لأن حدّ الجسم العام عشرة كيلوبايت
const postImport = (admin, payload) => request(app).post("/api/v1/admin/units/import").set("Cookie", admin).set("Content-Type", "text/plain").send(JSON.stringify(payload));

describe("admin export/import routes", () => {
  it("should export one unit and all units without mongo internals", async () => {
    const admin = await asAdmin();
    await postImport(admin, { units: [validUnit("earth-1-1")] });
    const one = await request(app).get("/api/v1/admin/units/earth-1-1/export").set("Cookie", admin);
    expect(one.status).toBe(200);
    expect(one.body.data.unit.unitId).toBe("earth-1-1");
    expect(one.body.data.unit._id).toBeUndefined();
    const all = await request(app).get("/api/v1/admin/export").set("Cookie", admin);
    expect(all.status).toBe(200);
    expect(all.body.data.count).toBe(all.body.data.units.length);
    expect(all.body.data.units.some((u) => u.unitId === "earth-1-1")).toBe(true);
    // ما يخرج من التصدير يدخل الاستيراد كما هو، بلا تنظيف يدوي
    expect((await postImport(admin, { units: all.body.data.units, dryRun: true })).body.data).toMatchObject({ failed: 0 });
  });

  it("should report per-unit errors and import nothing without force", async () => {
    const admin = await asAdmin();
    const res = await postImport(admin, { units: [validUnit("earth-1-1"), { unitId: "earth-1-2", title: "ناقصة" }] });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ applied: false, imported: 0, failed: 1 });
    expect((await request(app).get("/api/v1/admin/units").set("Cookie", admin)).body.data.units).toHaveLength(0);
    const forced = await postImport(admin, { units: [validUnit("earth-1-1"), { unitId: "earth-1-2", title: "ناقصة" }], force: true });
    expect(forced.body.data).toMatchObject({ applied: true, imported: 1, failed: 1 });
  });

  it("should refuse more than 100 units and malformed json", async () => {
    const admin = await asAdmin();
    const many = await postImport(admin, { units: Array.from({ length: 101 }, () => validUnit()) });
    expect(many.status).toBe(400);
    const broken = await request(app).post("/api/v1/admin/units/import").set("Cookie", admin).set("Content-Type", "text/plain").send("{ليس json");
    expect(broken.status).toBe(400);
    expect(broken.body.error.code).toBe("BAD_JSON");
  });

  it("should forbid import and export for non-admins", async () => {
    const user = cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "زائر", email: "v@example.com", password: "pass1234" }));
    expect((await request(app).get("/api/v1/admin/export").set("Cookie", user)).status).toBe(403);
    expect((await postImport(user, { units: [validUnit()] })).status).toBe(403);
  });
});

describe("admin version routes", () => {
  it("should list, read and restore a version", async () => {
    const admin = await asAdmin();
    const put = (body) => request(app).put("/api/v1/admin/units/earth-1-1").set("Cookie", admin).send(body);
    const { unitId, ...body } = validUnit("earth-1-1");
    expect((await put(body)).status).toBe(200);
    expect((await put({ ...body, title: "عنوان معدّل" })).status).toBe(200);

    const list = await request(app).get("/api/v1/admin/units/earth-1-1/versions").set("Cookie", admin);
    expect(list.status).toBe(200);
    expect(list.body.data.versions).toHaveLength(1);
    expect(list.body.data.versions[0]).toMatchObject({ version: 1, cards: 7, questions: 24, editedBy: "مشرف" });

    const one = await request(app).get("/api/v1/admin/units/earth-1-1/versions/1").set("Cookie", admin);
    expect(one.body.data.unit.title).toBe(body.title);

    const restored = await request(app).post("/api/v1/admin/units/earth-1-1/versions/1/restore").set("Cookie", admin);
    expect(restored.status).toBe(200);
    expect(restored.body.data.unit.title).toBe(body.title);
    expect((await request(app).get("/api/v1/admin/units/earth-1-1/versions").set("Cookie", admin)).body.data.versions).toHaveLength(2);
  });

  it("should 404 an unknown version and 400 a bad version number", async () => {
    const admin = await asAdmin();
    expect((await request(app).get("/api/v1/admin/units/earth-1-1/versions/4").set("Cookie", admin)).status).toBe(404);
    expect((await request(app).get("/api/v1/admin/units/earth-1-1/versions/abc").set("Cookie", admin)).status).toBe(400);
  });
});
