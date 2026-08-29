import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { unitParamSchema, upsertUnitSchema, setRoleSchema, versionParamSchema, importSchema } from "./admin.validation.js";
import { parseImportBody } from "./import.parser.js";
import * as ctrl from "./admin.controller.js";

export const prefix = "/admin";
const router = Router();

router.use(requireAdmin);
router.get("/overview", ctrl.overview);
router.get("/users", ctrl.users);
router.post("/users/role", validate(setRoleSchema), ctrl.setRole);
router.get("/export", ctrl.exportAll);
router.get("/units", ctrl.listUnits);
// المسارات الثابتة قبل :unitId حتى لا يبتلعها المتغيّر
router.post("/units/import", parseImportBody, validate(importSchema), ctrl.importUnits);
router.get("/units/:unitId", validate(unitParamSchema), ctrl.getUnit);
router.put("/units/:unitId", validate(upsertUnitSchema), ctrl.upsertUnit);
router.delete("/units/:unitId", validate(unitParamSchema), ctrl.deleteUnit);
router.get("/units/:unitId/export", validate(unitParamSchema), ctrl.exportUnit);
router.get("/units/:unitId/versions", validate(unitParamSchema), ctrl.listVersions);
router.get("/units/:unitId/versions/:version", validate(versionParamSchema), ctrl.getVersion);
router.post("/units/:unitId/versions/:version/restore", validate(versionParamSchema), ctrl.restoreVersion);

export default router;
