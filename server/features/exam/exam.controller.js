import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as exam from "./exam.service.js";

export const status = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await exam.status(req.user.id) });
});

export const start = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await exam.start(req.user.id) });
});

export const answer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await exam.saveAnswer(req.user.id, req.body.attemptId, req.body) });
});

export const submit = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await exam.submit(req.user.id, req.body.attemptId) });
});

export const verify = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await exam.verify(req.params.code) });
});
