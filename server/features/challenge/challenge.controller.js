import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as challenge from "./challenge.service.js";

export const today = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await challenge.todayChallenge(req.user.id) });
});

export const answer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await challenge.answerToday(req.user.id, req.body.answer) });
});
