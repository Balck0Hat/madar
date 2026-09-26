import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as placement from "./placement.service.js";

const router = Router();

const id = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) });
// choice: فهرس الخيار، أو النص المكتوب في أسئلة إكمال الفراغ
const answerSchema = { params: id, body: z.object({ itemId: z.string().max(40), choice: z.union([z.number().int().min(0).max(3), z.string().trim().min(1).max(40)]) }).strict() };
const writingSchema = { params: id, body: z.object({ text: z.string().trim().max(3000).optional(), skip: z.boolean().optional() }).strict().refine((b) => b.skip || (b.text && b.text.length >= 20), "نصّ قصير جداً") };

router.get("/placement", requireAuth, asyncHandler(async (req, res) => { res.json({ success: true, data: { session: await placement.current(req.user.id), history: await placement.history(req.user.id) } }); }));
router.post("/placement", requireAuth, asyncHandler(async (req, res) => { res.status(201).json({ success: true, data: { session: await placement.start(req.user.id) } }); }));
router.post("/placement/:id/answer", requireAuth, validate(answerSchema), asyncHandler(async (req, res) => { res.json({ success: true, data: await placement.answer(req.user.id, req.params.id, req.body) }); }));
router.post("/placement/:id/timeout", requireAuth, validate({ params: id }), asyncHandler(async (req, res) => { res.json({ success: true, data: { session: await placement.timeout(req.user.id, req.params.id) } }); }));
router.post("/placement/:id/writing", requireAuth, validate(writingSchema), asyncHandler(async (req, res) => { res.json({ success: true, data: { session: await placement.writing(req.user.id, req.params.id, req.body) } }); }));

export default router;
