import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

const params = z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") });

export const startSchema = {
  params,
  query: z.object({ n: z.coerce.number().int().min(1).max(30).default(10) }),
};

// selfMark هو التقييم الذاتي للسؤال المفتوح؛ لا يُقبل غيره من القيم
export const answerSchema = {
  params,
  body: z
    .object({
      qid: z.string().trim().min(1).max(24),
      answer: z.any().optional(),
      selfMark: z.enum(["got", "unclear"]).optional(),
    })
    .strict(),
};
