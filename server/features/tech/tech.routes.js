import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as tech from "./tech.service.js";

// قسم التقنية تحت /api/v1/tech: الشجرة، البحث، موضوع، ومفضلة
export const prefix = "/tech";
const router = Router();
const ok = (res, data) => res.json({ success: true, data });
const slug = z.object({ id: z.string().regex(/^[a-z0-9-]{2,40}$/) });

router.get("/", requireAuth, asyncHandler(async (req, res) => ok(res, await tech.tree(req.user.id))));
router.get("/search", requireAuth, validate({ query: z.object({ q: z.string().trim().max(60) }) }), asyncHandler(async (req, res) => ok(res, { hits: tech.search(req.query.q) })));
router.get("/interview/:id", requireAuth, validate({ params: slug }), asyncHandler(async (req, res) => ok(res, tech.interview(req.params.id))));
router.get("/:id", requireAuth, validate({ params: slug }), asyncHandler(async (req, res) => ok(res, { topic: await tech.topic(req.user.id, req.params.id) })));
router.post("/:id/mark", requireAuth, validate({ params: slug }), asyncHandler(async (req, res) => ok(res, await tech.toggleMark(req.user.id, req.params.id))));

export default router;
