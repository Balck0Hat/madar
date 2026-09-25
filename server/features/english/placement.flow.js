import { PLACEMENT, BANDS } from "../../shared/data/english/index.js";
import { GRAMMAR_MIN, GRAMMAR_MAX, nextLevel, estimateLevel, confidence, pickTwo, partLevel, overall, recommend, shouldStop } from "./placement.logic.js";
import { skills, kinds, plan } from "./placement.report.js";
import { effectiveLevel } from "./placement.calibrate.js";

// سير الجلسة: ما يُعرض في كل مرحلة، ومتى تنتقل، وكيف تُغلق عند انتهاء الوقت، وكيف تُحسب النتيجة.
export const BUDGET = { grammar: 12 * 60, reading: 14 * 60, listening: 10 * 60 }; // ثوانٍ لكل جزء
export const GRACE = 30 * 1000; // بعد المهلة: تُقبل الإجابة التي كانت في الطريق

export const byId = (pool) => new Map(pool.map((p) => [p.id, p]));
export const G = byId(PLACEMENT.grammar), R = byId(PLACEMENT.reading), L = byId(PLACEMENT.listening);
const POOL = { reading: R, listening: L };
const strip = ({ a, why, answers, ...q }) => q; // الإجابة لا تخرج قبل أن يُجاب

export const deadline = (s) => (BUDGET[s.stage] && s[s.stage].startedAt ? +s[s.stage].startedAt + BUDGET[s.stage] * 1000 : null);
const timer = (s) => (BUDGET[s.stage] ? { startedAt: s[s.stage].startedAt, budget: BUDGET[s.stage], now: Date.now() } : undefined);

// سؤال قواعد تالٍ بمستوى السلّم (بعد المعايرة)، من غير تكرار
export function nextGrammar(s) {
  const asked = new Set(s.grammar.ids);
  const level = nextLevel(s.grammar.answers);
  const pool = PLACEMENT.grammar.filter((it) => effectiveLevel(it) === level && !asked.has(it.id));
  const item = pool[Math.floor(Math.random() * pool.length)] || PLACEMENT.grammar.find((it) => !asked.has(it.id));
  return item ? { item: strip(item), n: s.grammar.answers.length + 1, min: GRAMMAR_MIN, max: GRAMMAR_MAX } : null;
}

// المقطع الحالي في القراءة/الاستماع: أول مقطع لم تُجب كل أسئلته
export function partPayload(s, stage) {
  const answered = new Set(s[stage].answers.map((a) => a.itemId));
  const id = s[stage].ids.find((x) => POOL[stage].get(x)?.qs.some((_, qi) => !answered.has(`${x}#${qi}`)));
  if (!id) return null;
  const p = POOL[stage].get(id);
  const payload = { ...p, qs: p.qs.map(strip), n: s[stage].ids.indexOf(id) + 1, of: s[stage].ids.length, from: p.qs.findIndex((_, qi) => !answered.has(`${id}#${qi}`)) };
  if (stage === "listening") payload.audio = `/audio/english/${p.id}.mp3`;
  return payload;
}

export function view(s) {
  const base = { id: String(s._id), stage: s.stage, timer: timer(s) };
  if (s.stage === "grammar") return { ...base, ...nextGrammar(s) };
  if (s.stage === "reading" || s.stage === "listening") return { ...base, part: partPayload(s, s.stage) };
  if (s.stage === "writing") return { ...base, writing: { ...PLACEMENT.writing.find((w) => w.id === s.writing.promptId), status: s.writing.status } };
  return { ...base, result: s.result, writing: s.writing };
}

// تصحيح سؤال: اختيار (فهرس) أو فراغ (نص يُطبَّع ويُقارن بكل الصيغ المقبولة)
const norm = (t) => String(t ?? "").toLowerCase().replace(/[^a-z0-9\s'-]/g, "").replace(/\s+/g, " ").trim();
export function grade(q, choice) {
  if (q.type === "gap") return { correct: q.answers.map(norm).includes(norm(choice)), a: q.answers[0] };
  return { correct: Number(choice) === q.a, a: q.a };
}

// انتهاء الوقت: ما لم يُجب في القراءة/الاستماع يُسجَّل خطأ، والقواعد تكتفي بما أُجيب
export function closeStage(s) {
  if (s.stage === "grammar") return;
  const answered = new Set(s[s.stage].answers.map((a) => a.itemId));
  for (const id of s[s.stage].ids) {
    const p = POOL[s.stage].get(id);
    p?.qs.forEach((_, qi) => { const itemId = `${id}#${qi}`; if (!answered.has(itemId)) s[s.stage].answers.push({ itemId, level: p.level, correct: false, choice: null, timedOut: true }); });
  }
}

const enter = (s, stage, ids) => { s.stage = stage; s[stage].ids = ids; s[stage].startedAt = new Date(); };

// الانتقال بين المراحل. force: انتهى الوقت فتُغلق المرحلة الحالية مهما كان ما أُجيب.
export function advance(s, { seen = new Set(), force = false } = {}) {
  const closing = (stage) => force && s.stage === stage && from === stage; // الإغلاق القسري للمرحلة الحالية فقط
  const from = s.stage;
  if (s.stage === "grammar" && (closing("grammar") || shouldStop(s.grammar.answers))) {
    enter(s, "reading", pickTwo(PLACEMENT.reading, estimateLevel(s.grammar.answers) || "B1", seen).map((p) => p.id));
  }
  if (s.stage === "reading" && s.reading.ids.length && (closing("reading") || !partPayload(s, "reading"))) {
    if (closing("reading")) closeStage(s);
    enter(s, "listening", pickTwo(PLACEMENT.listening, partLevel(s.reading, PLACEMENT.reading) || estimateLevel(s.grammar.answers) || "B1", seen).map((p) => p.id));
  }
  if (s.stage === "listening" && s.listening.ids.length && (closing("listening") || !partPayload(s, "listening"))) {
    if (closing("listening")) closeStage(s);
    const lvl = overall({ grammar: estimateLevel(s.grammar.answers), reading: partLevel(s.reading, PLACEMENT.reading), listening: partLevel(s.listening, PLACEMENT.listening) })?.level || "B1";
    s.stage = "writing"; s.writing.promptId = (PLACEMENT.writing.find((w) => w.levels.includes(lvl)) || PLACEMENT.writing[1]).id;
  }
}

export function finish(s) {
  const g = confidence(s.grammar.answers);
  const parts = { grammar: g.level, reading: partLevel(s.reading, PLACEMENT.reading), listening: partLevel(s.listening, PLACEMENT.listening), writing: s.writing.status === "done" ? s.writing.cefr : null };
  const res = overall(parts);
  if (res) {
    const sk = skills(s.grammar.answers, G);
    const kd = kinds({ reading: s.reading, listening: s.listening }, { reading: PLACEMENT.reading, listening: PLACEMENT.listening });
    const weakKinds = kd.filter((k) => k.n >= 2 && k.rate < 60);
    s.result = { ...res, confidence: g.confidence, range: g.range, skills: sk, kinds: kd, plan: plan(res.level, sk.weak, weakKinds), recommendation: recommend(res.level), bands: BANDS };
  } else s.result = null;
  s.stage = "done"; s.finishedAt = new Date();
}
