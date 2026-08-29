import { z } from "zod";
import { isValidUnitId, parseUnitId } from "../../shared/utils/units.js";
import { titleOf } from "../../shared/data/tree.js";

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
    examOnly: z.boolean().optional(),
  })
  .superRefine((q, ctx) => {
    // الامتحان يُصحَّح آلياً بلا تدخل بشري، فلا يقبل سؤالاً مفتوحاً في بنكه المحجوز
    if (q.examOnly && q.t === "open") ctx.addIssue({ code: "custom", message: "السؤال المفتوح لا يصلح لبنك الامتحان", path: ["examOnly"] });
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

// ── قواعد بنيوية (مرآة scripts/validate-seed.js) ──
// زود يتحقق من الأنواع والحدود العليا؛ هذه تتحقق من الاكتمال: وحدة تمر بزود
// وهي ناقصة (3 بطاقات، بلا خيط) لا تصلح للنشر. الحدود الدنيا تختلف بحسب المدار.
const RING_LIMITS = { 0: { questions: 24, cards: 7 }, 1: { questions: 30, cards: 11 }, 2: { questions: 32, cards: 13 } };

// عدد الأسئلة المحجوزة للامتحان في كل وحدة (scripts/mark-exam-questions.js يعلّمها)
export const EXAM_RESERVE = 6;
export const isPractice = (q) => q.examOnly !== true;

const isPermutation = (arr, n) => Array.isArray(arr) && arr.length === n && new Set(arr).size === n && arr.every((x) => Number.isInteger(x) && x >= 0 && x < n);

function questionErrors(q) {
  const errs = [];
  if (q.t === "mcq") {
    const n = (q.opts || []).length;
    if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < n)) errs.push(`${q.qid}: إجابة الاختيار خارج الخيارات`);
    if (new Set(q.opts || []).size !== n) errs.push(`${q.qid}: خيارات مكررة`);
  }
  if (q.t === "order" && !isPermutation(q.a, (q.items || []).length)) errs.push(`${q.qid}: الترتيب ليس تبديلاً صحيحاً لعناصره`);
  if (q.t === "open" && !(q.keywords?.length >= 3)) errs.push(`${q.qid}: سؤال مفتوح بلا 3 كلمات مفتاحية`);
  return errs;
}

function threadErrors(thread, me) {
  if (!thread) return ["لا خيط"];
  const errs = [];
  const to = parseUnitId(thread.to);
  if (!to) errs.push("thread.to غير صالح");
  else if (!to.center && !me.center && to.domain === me.domain) errs.push("thread.to في المجال نفسه");
  if (!(thread.a >= 0 && thread.a < (thread.opts || []).length)) errs.push("thread.a خارج الخيارات");
  return errs;
}

export function checkStructure(unit) {
  const me = parseUnitId(unit?.unitId);
  if (!me) return ["معرّف وحدة غير صالح"];
  const { questions: MIN_Q, cards: MIN_C } = RING_LIMITS[me.ring] ?? RING_LIMITS[0];
  const cards = unit.cards || [], qs = unit.questions || [];
  const errs = [];
  if (!titleOf(unit.unitId)) errs.push("لا عنوان لهذا المعرّف في الشجرة");
  if (cards.length < MIN_C) errs.push(`البطاقات ${cards.length} < ${MIN_C}`);
  if (qs.length < MIN_Q) errs.push(`الأسئلة ${qs.length} < ${MIN_Q}`);
  const seen = new Set();
  for (const q of qs) {
    if (seen.has(q.qid)) errs.push(`qid مكرر ${q.qid}`);
    seen.add(q.qid);
    errs.push(...questionErrors(q));
  }
  // البنك يُقرأ مرتين: كله يفي بالحد الأدنى، وما يبقى بعد حجز الامتحان يكفي للتمرين
  const practice = qs.filter(isPractice);
  if (practice.length < MIN_Q - EXAM_RESERVE) errs.push(`أسئلة التمرين ${practice.length} < ${MIN_Q - EXAM_RESERVE}`);
  const count = (t) => practice.filter((q) => q.t === t).length;
  if (count("mcq") < 10) errs.push(`أسئلة الاختيار ${count("mcq")} < 10`);
  if (!count("open")) errs.push("لا سؤال مفتوح");
  if (count("open") > 3) errs.push("أكثر من 3 أسئلة مفتوحة");
  if (!(unit.summary?.length >= 3)) errs.push("الخلاصة أقل من 3 نقاط");
  if (!(unit.goals?.length >= 3)) errs.push("الأهداف أقل من 3");
  errs.push(...threadErrors(unit.thread, me));
  return errs;
}

export const getUnitSchema = { params: unitIdParam };
export const quizSchema = { params: unitIdParam, query: z.object({ n: z.coerce.number().int().min(1).max(30).default(10) }) };
export const summariesSchema = { query: z.object({ ids: z.string().max(3000).default("") }) };
export const upsertUnitSchema = { params: unitIdParam, body: unitBody.strict() };
