import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as league from "./league.service.js";

export const standings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await league.standings(req.user.id) });
});
