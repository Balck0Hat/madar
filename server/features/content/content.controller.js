import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as content from "./content.service.js";

export const listIds = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { ids: await content.listPublishedIds() } });
});

export const getUnit = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { unit: await content.getPublishedUnit(req.params.unitId, req.user?.id) } });
});

export const getQuiz = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await content.pickQuiz(req.params.unitId, req.query.n, req.user.id) });
});

export const getSummaries = asyncHandler(async (req, res) => {
  const ids = req.query.ids.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 300);
  res.json({ success: true, data: { summaries: await content.summaries(ids) } });
});
