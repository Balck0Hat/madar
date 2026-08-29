import { z } from "zod";

// الإجابة تختلف بحسب نوع السؤال: مؤشر خيار، صح/خطأ، نص، أو ترتيب
const answerValue = z.union([
  z.number().int().min(0).max(99),
  z.boolean(),
  z.string().trim().max(300),
  z.array(z.union([z.number().int().min(0).max(99), z.string().trim().max(200)])).max(10),
]);

export const answerSchema = { body: z.object({ answer: answerValue }).strict() };
