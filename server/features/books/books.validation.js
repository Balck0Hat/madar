import { z } from "zod";

const bookId = z.string().regex(/^[a-z0-9-]{2,40}$/, "معرّف غير صالح");

export const bookSchema = { params: z.object({ bookId }) };
export const chapterSchema = { params: z.object({ bookId, n: z.coerce.number().int().min(1).max(99) }) };
export const progressSchema = {
  params: z.object({ bookId }),
  body: z.object({ chapter: z.number().int().min(1).max(99).optional(), read: z.boolean().optional() }).strict(),
};
