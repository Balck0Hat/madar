import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

const unitId = z.string().refine(isValidUnitId, "معرّف وحدة غير صالح");

export const finishSchema = {
  params: z.object({ unitId }),
  body: z
    .object({
      correct: z.number().int().min(0),
      total: z.number().int().min(1).max(50),
      sim: z.boolean().optional().default(false),
    })
    .strict()
    .refine((b) => b.correct <= b.total, { message: "الإجابات الصحيحة لا تتجاوز المجموع", path: ["correct"] }),
};
