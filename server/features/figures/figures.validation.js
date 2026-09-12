import { z } from "zod";

export const listSchema = {
  query: z.object({
    era: z.string().max(20).optional(),
    category: z.string().max(30).optional(),
    q: z.string().trim().max(60).optional(),
  }),
};

export const getSchema = { params: z.object({ figureId: z.string().regex(/^[a-z0-9-]{2,40}$/, "معرّف غير صالح") }) };
