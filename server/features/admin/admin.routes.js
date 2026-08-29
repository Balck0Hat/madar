import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { unitParamSchema, upsertUnitSchema, setRoleSchema } from "./admin.validation.js";
import * as ctrl from "./admin.controller.js";

export const prefix = "/admin";
const router = Router();

router.use(requireAdmin);
router.get("/overview", ctrl.overview);
router.get("/users", ctrl.users);
router.post("/users/role", validate(setRoleSchema), ctrl.setRole);
router.get("/units", ctrl.listUnits);
router.get("/units/:unitId", validate(unitParamSchema), ctrl.getUnit);
router.put("/units/:unitId", validate(upsertUnitSchema), ctrl.upsertUnit);
router.delete("/units/:unitId", validate(unitParamSchema), ctrl.deleteUnit);

export default router;
