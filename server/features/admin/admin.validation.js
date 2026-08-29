import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";
import { unitBody } from "../content/content.validation.js";

const unitIdParam = z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") });

export const unitParamSchema = { params: unitIdParam };
export const upsertUnitSchema = { params: unitIdParam, body: unitBody.strict() };
export const setRoleSchema = {
  body: z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(["user", "admin"]) }).strict(),
};
