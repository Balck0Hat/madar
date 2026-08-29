import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as progressService from "./progress.service.js";
import { personalStats } from "./progress.stats.js";

export const getState = asyncHandler(async (req, res) => {
  const state = await progressService.getState(req.user.id);
  res.json({ success: true, data: { state } });
});

export const finishUnit = asyncHandler(async (req, res) => {
  const data = await progressService.finishUnit(req.user.id, req.params.unitId, req.body);
  res.json({ success: true, data });
});

export const setResume = asyncHandler(async (req, res) => {
  const resume = await progressService.setResume(req.user.id, req.params.unitId, req.body.card);
  res.json({ success: true, data: { resume } });
});

export const getStats = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { stats: await personalStats(req.user.id) } });
});
