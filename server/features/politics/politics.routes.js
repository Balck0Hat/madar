import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { countrySchema } from "./politics.validation.js";
import * as ctrl from "./politics.controller.js";

export const prefix = "/politics";
const router = Router();

router.get("/overview", requireAuth, ctrl.overview);
router.get("/countries", requireAuth, ctrl.listCountries);
router.get("/countries/:countryId", requireAuth, validate(countrySchema), ctrl.getCountry);
router.get("/titles", requireAuth, ctrl.listTitles);

export default router;
