import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as analytics from "./analytics.service.js";

export const event = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analytics.record(req.user.id, req.body) });
});

export const funnel = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analytics.funnel(req.query) });
});

export const hardQuestions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await analytics.hardQuestions(req.query) });
});
