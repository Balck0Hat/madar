import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as attempts from "./quizAttempt.service.js";

export const start = asyncHandler(async (req, res) => {
  const attempt = await attempts.startAttempt(req.user.id, req.params.unitId, req.query.n);
  res.json({ success: true, data: attempt });
});

export const saveAnswer = asyncHandler(async (req, res) => {
  const saved = await attempts.saveAnswer(req.user.id, req.params.unitId, req.body);
  res.json({ success: true, data: saved });
});
