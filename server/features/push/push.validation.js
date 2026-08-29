import { z } from "zod";

export const subscribeSchema = {
  body: z
    .object({
      endpoint: z.string().url().max(1000),
      keys: z.object({ p256dh: z.string().min(10).max(300), auth: z.string().min(5).max(100) }),
      expirationTime: z.number().nullable().optional(),
    })
    .strict(),
};

export const unsubscribeSchema = {
  body: z.object({ endpoint: z.string().url().max(1000).optional() }).strict(),
};
