import { z } from "zod";

export const countrySchema = { params: z.object({ countryId: z.string().regex(/^[a-z0-9-]{2,40}$/, "معرّف غير صالح") }) };
