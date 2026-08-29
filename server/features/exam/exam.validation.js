import { z } from "zod";

const answer = z.object({ unitId: z.string().max(20), qid: z.string().max(24), answer: z.any() });

export const submitSchema = {
  body: z.object({ attemptId: z.string().length(24), answers: z.array(answer).max(60) }).strict(),
};

export const verifySchema = {
  params: z.object({ code: z.string().trim().toUpperCase().regex(/^MDR-\d{4}-[A-Z0-9]{5}$/, "رمز غير صالح") }),
};
