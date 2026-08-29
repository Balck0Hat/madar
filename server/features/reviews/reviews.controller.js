import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as reviews from "./reviews.service.js";

export const due = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reviews.dueList(req.user.id) });
});

export const answer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reviews.answer(req.user.id, req.params.unitId, req.body.correct, req.body.qid) });
});
