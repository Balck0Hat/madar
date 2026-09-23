import { z } from "zod";

const sura = z.coerce.number().int().min(1).max(114);
const ayah = z.coerce.number().int().min(1).max(286);

export const suraSchema = { params: z.object({ n: sura }) };
export const pageSchema = { params: z.object({ p: z.coerce.number().int().min(1).max(604) }) };
export const ayahSchema = { params: z.object({ s: sura, a: ayah }) };

export const goalSchema = {
  body: z.object({
    kind: z.enum(["sura", "juz", "page"]),
    from: z.number().int().min(1),
    to: z.number().int().min(1),
    perDay: z.number().int().min(1).max(30).default(3),
  }).strict().refine((g) => g.to >= g.from, "المدى غير صالح")
    .refine((g) => (g.kind === "sura" ? g.to <= 114 : g.kind === "juz" ? g.to <= 30 : g.to <= 604), "خارج المصحف"),
};

export const reviewSchema = { body: z.object({ s: sura, a: ayah, correct: z.boolean() }).strict() };
export const sessionSchema = { body: z.object({ with: z.string().trim().min(1).max(60), ayahs: z.number().int().min(1).max(700) }).strict() };
