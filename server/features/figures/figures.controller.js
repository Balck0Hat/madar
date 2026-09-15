import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as figures from "./figures.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { figures: await figures.list(req.query) } });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { figure: await figures.get(req.params.figureId) } });
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { progress: await figures.getProgress(req.user.id) } });
});

export const setProgress = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { progress: await figures.setProgress(req.user.id, req.params.figureId, req.body) } });
});
