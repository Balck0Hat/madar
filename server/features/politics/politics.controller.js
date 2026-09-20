import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as politics from "./politics.service.js";

export const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: politics.overview() });
});

export const listCountries = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { countries: politics.listCountries() } });
});

export const getCountry = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { country: politics.getCountry(req.params.countryId) } });
});

export const listTitles = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { families: politics.listTitles() } });
});
