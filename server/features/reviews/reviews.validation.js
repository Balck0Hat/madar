import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

export const answerSchema = {
  params: z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") }),
  body: z.object({ correct: z.boolean() }).strict(),
};
