import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as admin from "./admin.service.js";
import * as content from "../content/content.service.js";

export const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await admin.overview() });
});

export const users = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { users: await admin.recentUsers() } });
});

export const setRole = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: await admin.setRole(req.body.email, req.body.role) } });
});

export const listUnits = asyncHandler(async (req, res) => {
  const units = (await content.listAllUnits()).map((u) => ({ unitId: u.unitId, title: u.title, published: u.published, updatedAt: u.updatedAt, questionCount: u.questions?.length || 0 }));
  res.json({ success: true, data: { units } });
});

export const getUnit = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { unit: await content.getUnitForEdit(req.params.unitId) } });
});

export const upsertUnit = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { unit: await content.upsertUnit(req.params.unitId, req.body, req.user.id) } });
});

export const deleteUnit = asyncHandler(async (req, res) => {
  await content.deleteUnit(req.params.unitId);
  res.status(204).end();
});
