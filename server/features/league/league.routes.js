import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import * as ctrl from "./league.controller.js";

export const prefix = "/league";
const router = Router();

router.get("/", requireAuth, ctrl.standings);

export default router;
