import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../../../app.js";
import Note from "../note.model.js";
import { MAX_NOTES } from "../notes.service.js";

let app;
beforeAll(async () => { app = await createApp(); });

const cookiesOf = (res) => (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const asUser = async (email) =>
  cookiesOf(await request(app).post("/api/v1/auth/register").send({ name: "قارئ", email, password: "pass1234" }));

const body = (over = {}) => ({ unitId: "center-1", page: 2, text: "الاسترجاع يثبّت المعلومة", ...over });

describe("notes routes", () => {
  it("should require auth on every note route", async () => {
    expect((await request(app).post("/api/v1/notes").send(body())).status).toBe(401);
    expect((await request(app).get("/api/v1/notes")).status).toBe(401);
    expect((await request(app).delete("/api/v1/notes/64b0c0c0c0c0c0c0c0c0c0c0")).status).toBe(401);
  });

  it("should create a highlight and list it for its unit", async () => {
    const user = await asUser("a@example.com");
    const created = await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ note: "قاعدة مهمة", color: "green" }));
    expect(created.status).toBe(201);
    expect(created.body.data.note).toMatchObject({ unitId: "center-1", page: 2, note: "قاعدة مهمة", color: "green" });

    const mine = await request(app).get("/api/v1/notes?unitId=center-1").set("Cookie", user);
    expect(mine.status).toBe(200);
    expect(mine.body.data.notes).toHaveLength(1);
    expect((await request(app).get("/api/v1/notes?unitId=center-2").set("Cookie", user)).body.data.notes).toHaveLength(0);
  });

  it("should list all of the user's notes newest first", async () => {
    const user = await asUser("b@example.com");
    await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ text: "أول" }));
    await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ unitId: "human-1-1", text: "ثانٍ" }));
    const all = await request(app).get("/api/v1/notes").set("Cookie", user);
    expect(all.body.data.notes.map((n) => n.text)).toEqual(["ثانٍ", "أول"]);
  });

  it("should edit the note text and delete the highlight", async () => {
    const user = await asUser("c@example.com");
    const id = (await request(app).post("/api/v1/notes").set("Cookie", user).send(body())).body.data.note.id;
    const edited = await request(app).patch(`/api/v1/notes/${id}`).set("Cookie", user).send({ note: "صياغة أوضح" });
    expect(edited.status).toBe(200);
    expect(edited.body.data.note.note).toBe("صياغة أوضح");
    expect((await request(app).delete(`/api/v1/notes/${id}`).set("Cookie", user)).status).toBe(200);
    expect((await request(app).get("/api/v1/notes").set("Cookie", user)).body.data.notes).toHaveLength(0);
  });

  it("should reject an invalid unit, an over-long text and a bad id", async () => {
    const user = await asUser("d@example.com");
    expect((await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ unitId: "nope-9-9" }))).status).toBe(400);
    expect((await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ text: "ب".repeat(601) }))).status).toBe(400);
    expect((await request(app).post("/api/v1/notes").set("Cookie", user).send(body({ color: "purple" }))).status).toBe(400);
    expect((await request(app).delete("/api/v1/notes/not-an-id").set("Cookie", user)).status).toBe(400);
  });

  it("should refuse a new highlight once the per-user cap is reached", async () => {
    const user = await asUser("e@example.com");
    const me = await request(app).get("/api/v1/users/me").set("Cookie", user);
    const userId = new mongoose.Types.ObjectId(me.body.data.user.id);
    // نملأ السقف مباشرة في القاعدة: أسرع بكثير من 500 طلب HTTP والسلوك المختبَر واحد
    await Note.insertMany(Array.from({ length: MAX_NOTES }, (_, i) => ({ user: userId, unitId: "center-1", page: 0, text: `سطر ${i}` })));
    const res = await request(app).post("/api/v1/notes").set("Cookie", user).send(body());
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("NOTES_LIMIT");
  });

  it("should not let a user read, edit or delete another user's note", async () => {
    const owner = await asUser("owner@example.com");
    const other = await asUser("other@example.com");
    const id = (await request(app).post("/api/v1/notes").set("Cookie", owner).send(body({ note: "سرّي" }))).body.data.note.id;

    expect((await request(app).get("/api/v1/notes?unitId=center-1").set("Cookie", other)).body.data.notes).toHaveLength(0);
    expect((await request(app).get("/api/v1/notes").set("Cookie", other)).body.data.notes).toHaveLength(0);
    expect((await request(app).patch(`/api/v1/notes/${id}`).set("Cookie", other).send({ note: "اختراق" })).status).toBe(404);
    expect((await request(app).delete(`/api/v1/notes/${id}`).set("Cookie", other)).status).toBe(404);
    // التظليل بقي كما هو لصاحبه
    expect((await request(app).get("/api/v1/notes").set("Cookie", owner)).body.data.notes[0].note).toBe("سرّي");
  });
});
