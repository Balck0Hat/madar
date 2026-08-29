import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";

const unitIdParam = z.object({ unitId: z.string().refine(isValidUnitId, "معرّف وحدة غير صالح") });

const question = z
  .object({
    qid: z.string().trim().min(1).max(24),
    t: z.enum(["mcq", "tf", "fill", "order", "open"]),
    q: z.string().trim().min(3).max(500),
    opts: z.array(z.string().trim().min(1).max(200)).max(6).optional(),
    items: z.array(z.string().trim().min(1).max(200)).max(8).optional(),
    a: z.any().optional(),
    why: z.string().trim().max(600).optional(),
    keywords: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .superRefine((q, ctx) => {
    if (q.t === "mcq" && !(q.opts?.length >= 2 && Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length)) ctx.addIssue({ code: "custom", message: "mcq يحتاج خيارات ومؤشر إجابة صحيح", path: ["a"] });
    if (q.t === "tf" && typeof q.a !== "boolean") ctx.addIssue({ code: "custom", message: "tf يحتاج إجابة صح/خطأ", path: ["a"] });
    if (q.t === "fill" && !(Array.isArray(q.a) && q.a.length)) ctx.addIssue({ code: "custom", message: "fill يحتاج قائمة إجابات مقبولة", path: ["a"] });
    if (q.t === "order" && !(q.items?.length >= 2 && Array.isArray(q.a) && q.a.length === q.items.length)) ctx.addIssue({ code: "custom", message: "order يحتاج عناصر وترتيباً بنفس الطول", path: ["a"] });
  });

const card = z.object({ h: z.string().trim().min(1).max(120), p: z.string().trim().min(1).max(1200), art: z.string().trim().max(30).optional(), img: z.string().trim().max(200).optional() });

export const unitBody = z.object({
  title: z.string().trim().min(3).max(160),
  hero: z.object({ num: z.string().max(12), label: z.string().max(120) }).optional(),
  spark: z.string().trim().max(1500).optional(),
  goals: z.array(z.string().trim().min(1).max(200)).max(8).default([]),
  cards: z.array(card).max(14).default([]),
  tryIt: z.object({ title: z.string().max(120), text: z.string().max(1200) }).optional(),
  deep: z.object({ title: z.string().max(200), why: z.string().max(800) }).optional(),
  thread: z.object({ to: z.string().refine(isValidUnitId), text: z.string().max(800), q: z.string().max(300), opts: z.array(z.string().max(120)).min(2).max(6), a: z.number().int().min(0), why: z.string().max(600) }).optional(),
  summary: z.array(z.string().trim().min(1).max(300)).max(8).default([]),
  questions: z.array(question).max(60).default([]),
  published: z.boolean().default(false),
});

export const getUnitSchema = { params: unitIdParam };
export const quizSchema = { params: unitIdParam, query: z.object({ n: z.coerce.number().int().min(1).max(30).default(10) }) };
export const summariesSchema = { query: z.object({ ids: z.string().max(3000).default("") }) };
export const upsertUnitSchema = { params: unitIdParam, body: unitBody.strict() };
