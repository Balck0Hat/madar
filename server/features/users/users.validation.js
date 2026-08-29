import { z } from "zod";
import { DOMAIN_IDS } from "../../shared/data/curriculum.js";

export const updateMeSchema = {
  body: z
    .object({
      name: z.string().trim().min(1, "الاسم مطلوب").max(40).optional(),
      minutes: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
      fav: z.enum(DOMAIN_IDS).optional(),
      arabicNums: z.boolean().optional(),
      reminders: z.boolean().optional(),
      theme: z.enum(["system", "dark", "light"]).optional(),
      fontScale: z.number().min(0.9).max(1.4).optional(),
    })
    .strict(),
};
