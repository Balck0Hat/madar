import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as notes from "./notes.service.js";

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { note: await notes.create(req.user.id, req.body) } });
});

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await notes.list(req.user.id, req.query.unitId) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { note: await notes.update(req.user.id, req.params.id, req.body.note) } });
});

export const remove = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await notes.remove(req.user.id, req.params.id) });
});
