import { Router } from "express";
import placement from "./placement.router.js";
import tracks from "./tracks.router.js";

// قسم الإنجليزية تحت /api/v1/english: اختبار المستوى، والمسارات (آيلتس، توفل، الإنجليزية العامة)
export const prefix = "/english";
const router = Router();
router.use(placement);
router.use(tracks);

export default router;
