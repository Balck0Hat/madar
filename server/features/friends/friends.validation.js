import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "معرّف غير صالح");

export const requestSchema = {
  body: z.object({ handle: z.string().trim().min(1, "المعرّف مطلوب").max(40) }).strict(),
};

export const idParamSchema = { params: z.object({ id: objectId }) };
