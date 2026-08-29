import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as pub from "./public.service.js";

export const profile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { profile: await pub.profileByHandle(req.params.handle) } });
});
