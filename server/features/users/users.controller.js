import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as usersService from "./users.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  res.json({ success: true, data: { user } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateMe(req.user.id, req.body);
  res.json({ success: true, data: { user } });
});
