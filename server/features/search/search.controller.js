import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as searchService from "./search.service.js";

export const search = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await searchService.search(req.query.q) });
});
