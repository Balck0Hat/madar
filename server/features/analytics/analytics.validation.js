import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";
import { EVENT_KINDS } from "./unitEvent.model.js";

// الوحدة أربع عشرة بطاقة على الأكثر، والسقف الفضفاض يمنع تسميم الإحصاء بأرقام خيالية
const MAX_PAGE = 60;

export const eventSchema = {
  body: z
    .object({
      unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح"),
      kind: z.enum(EVENT_KINDS),
      page: z.number().int().min(1).max(MAX_PAGE).optional(),
    })
    .strict()
    .refine((v) => v.kind !== "page" || Number.isInteger(v.page), { message: "حدث الصفحة يحتاج رقم بطاقة", path: ["page"] }),
};

export const funnelSchema = {
  query: z
    .object({
      days: z.coerce.number().int().min(1).max(365).default(90),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .strict(),
};

export const hardSchema = {
  query: z
    .object({
      min: z.coerce.number().int().min(1).max(1000).default(5),
      limit: z.coerce.number().int().min(1).max(100).default(30),
    })
    .strict(),
};
