import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as quran from "./quran.service.js";

export const suras = asyncHandler(async (req, res) => { res.json({ success: true, data: { suras: quran.suras() } }); });
export const sura = asyncHandler(async (req, res) => { res.json({ success: true, data: { sura: quran.sura(req.params.n) } }); });
export const page = asyncHandler(async (req, res) => { res.json({ success: true, data: quran.page(req.params.p) }); });
export const similar = asyncHandler(async (req, res) => { res.json({ success: true, data: { similar: quran.similar(req.params.s, req.params.a) } }); });

export const overview = asyncHandler(async (req, res) => { res.json({ success: true, data: await quran.overview(req.user.id) }); });
export const setGoal = asyncHandler(async (req, res) => { res.json({ success: true, data: await quran.setGoal(req.user.id, req.body) }); });
export const review = asyncHandler(async (req, res) => {
  const { s, a, correct } = req.body;
  res.json({ success: true, data: { item: await quran.review(req.user.id, s, a, correct) } });
});
export const logSession = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { sessions: await quran.logSession(req.user.id, req.body.with, req.body.ayahs) } });
});
