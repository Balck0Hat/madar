import { z } from "zod";

const figureId = z.string().regex(/^[a-z0-9-]{2,40}$/, "معرّف غير صالح");

export const listSchema = {
  query: z.object({
    era: z.string().max(20).optional(),
    category: z.string().max(30).optional(),
    q: z.string().trim().max(60).optional(),
  }),
};

export const getSchema = { params: z.object({ figureId }) };

export const progressSchema = {
  params: z.object({ figureId }),
  body: z.object({ page: z.number().int().min(0).max(50).optional(), read: z.boolean().optional() }).strict(),
};
