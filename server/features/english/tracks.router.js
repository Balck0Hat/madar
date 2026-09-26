import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as tracks from "./tracks.service.js";
import * as practice from "./practice.service.js";
import { calibrate, summary } from "./placement.calibrate.js";
import { PLACEMENT } from "../../shared/data/english/index.js";

// المسارات: نظرة عامة، وحدات آيلتس/توفل، دروس الإنجليزية العامة، تمرين نقاط الضعف، مهام الكتابة، ولوحة المعايرة
const router = Router();
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const oid = z.string().regex(/^[a-f0-9]{24}$/);
const slug = z.string().regex(/^[a-z0-9-]{2,40}$/);
const choice = z.union([z.number().int().min(0).max(9), z.string().trim().min(1).max(60), z.array(z.number().int().min(0).max(9)).max(6)]);
const sectionSchema = { params: z.object({ id: oid }), body: z.object({ sectionId: z.string().max(20), answers: z.array(z.object({ itemId: z.string().max(40), choice })).max(60) }).strict() };
const answerSchema = { params: z.object({ id: oid }), body: z.object({ itemId: z.string().max(40), choice }).strict() };
const textSchema = { params: z.object({ id: slug }), body: z.object({ text: z.string().trim().min(20).max(6000) }).strict() };

router.get("/tracks", requireAuth, asyncHandler(async (req, res) => ok(res, await tracks.overview(req.user.id))));
router.get("/tracks/modules/:id", requireAuth, validate({ params: z.object({ id: slug }) }), asyncHandler(async (req, res) => ok(res, await tracks.getModule(req.user.id, req.params.id))));
router.post("/tracks/modules/:id/start", requireAuth, validate({ params: z.object({ id: slug }) }), asyncHandler(async (req, res) => ok(res, { attempt: await tracks.startModule(req.user.id, req.params.id) }, 201)));
router.post("/practice/:id/section", requireAuth, validate(sectionSchema), asyncHandler(async (req, res) => ok(res, await tracks.submitSection(req.user.id, req.params.id, req.body))));

router.get("/tracks/lessons/:tag", requireAuth, validate({ params: z.object({ tag: slug }) }), asyncHandler(async (req, res) => ok(res, { lesson: practice.getLesson(req.params.tag) })));
router.post("/tracks/lessons/:tag/start", requireAuth, validate({ params: z.object({ tag: slug }) }), asyncHandler(async (req, res) => ok(res, await practice.startPractice(req.user.id, "lesson", req.params.tag), 201)));
router.post("/tracks/weak/:tag/start", requireAuth, validate({ params: z.object({ tag: slug }) }), asyncHandler(async (req, res) => ok(res, await practice.startPractice(req.user.id, "weak", req.params.tag), 201)));
router.post("/practice/:id/answer", requireAuth, validate(answerSchema), asyncHandler(async (req, res) => ok(res, await practice.answerPractice(req.user.id, req.params.id, req.body))));
router.get("/practice/:id", requireAuth, validate({ params: z.object({ id: oid }) }), asyncHandler(async (req, res) => ok(res, { attempt: await practice.getAttempt(req.user.id, req.params.id) })));

router.get("/tracks/writing/:id", requireAuth, validate({ params: z.object({ id: slug }) }), asyncHandler(async (req, res) => ok(res, { task: practice.getWritingTask(req.params.id), history: await practice.writingHistory(req.user.id, req.params.id) })));
router.post("/tracks/writing/:id", requireAuth, validate(textSchema), asyncHandler(async (req, res) => ok(res, { attempt: await practice.submitWriting(req.user.id, req.params.id, req.body.text) }, 201)));

router.get("/admin/calibration", requireAdmin, asyncHandler(async (req, res) => ok(res, await summary(PLACEMENT.grammar))));
router.post("/admin/calibrate", requireAdmin, asyncHandler(async (req, res) => ok(res, { run: await calibrate(), ...(await summary(PLACEMENT.grammar)) })));

export default router;
