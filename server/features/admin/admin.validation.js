import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";
import { unitBody } from "../content/content.validation.js";

const unitIdParam = z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") });

export const unitParamSchema = { params: unitIdParam };
export const upsertUnitSchema = { params: unitIdParam, body: unitBody.strict() };
export const versionParamSchema = { params: unitIdParam.extend({ version: z.coerce.number().int().min(1) }) };
// الوحدات تُفحص واحدة واحدة في الخدمة لنعيد تقريراً لكل وحدة، لا خطأ واحداً للدفعة
export const importSchema = {
  body: z
    .object({
      units: z.array(z.any()).min(1, "لا وحدات في الملف").max(100, "الحد 100 وحدة في الاستيراد الواحد"),
      force: z.boolean().default(false),
      dryRun: z.boolean().default(false),
    })
    .strict(),
};
export const setRoleSchema = {
  body: z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(["user", "admin"]) }).strict(),
};
