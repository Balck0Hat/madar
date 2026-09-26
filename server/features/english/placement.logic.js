import { LEVELS, levelIndex, BANDS } from "../../shared/data/english/index.js";

// منطق اختبار المستوى، خالٍ من قاعدة البيانات ليُختبر وحده.
export const GRAMMAR_MIN = 12; // لا يتوقف قبلها
export const GRAMMAR_MAX = 24; // ولا يتجاوزها
export const GRAMMAR_ITEMS = GRAMMAR_MAX;
const START = 2; // B1
const WINDOW = 12; // آخر كم إجابة تدخل في التقدير
const SETTLE = 6; // كم سؤالاً متتالياً يجب أن يتأرجح بين مستويين متجاورين ليُعدّ المستوى مستقراً

// السلّم التكيّفي: إجابتان صحيحتان متتاليتان تصعد مستوى، وخطأ واحد ينزل مستوى
export function nextLevel(answers, start = START) {
  let level = Math.max(0, Math.min(LEVELS.length - 1, start));
  let streak = 0;
  for (const a of answers) {
    if (a.correct) { streak++; if (streak >= 2) { level = Math.min(LEVELS.length - 1, level + 1); streak = 0; } }
    else { level = Math.max(0, level - 1); streak = 0; }
  }
  return LEVELS[level];
}

const span = (answers, k) => { const ls = answers.slice(-k).map((a) => levelIndex(a.level)); return ls.length ? Math.max(...ls) - Math.min(...ls) + 1 : 0; };

// قاعدة الإيقاف: بعد الحد الأدنى يتوقف حين تستقر آخر ستة أسئلة بين مستويين متجاورين
// (أو مستوى واحد عند القمة والقاع)، وإلا يستمر حتى الحد الأقصى.
export const shouldStop = (answers) => answers.length >= GRAMMAR_MAX || (answers.length >= GRAMMAR_MIN && span(answers, SETTLE) <= 2);

const stats = (answers) => {
  const out = {};
  for (const a of answers) { const s = out[a.level] || (out[a.level] = { n: 0, ok: 0 }); s.n++; if (a.correct) s.ok++; }
  return out;
};

// المستوى المقدَّر من الإجابات: أعلى مستوى أصاب فيه القارئ 60% فأكثر من ثلاثة أسئلة فأكثر،
// وإلا أدنى مستوى حاوله. تُؤخذ آخر 12 إجابة لأن البداية استكشاف.
export function estimateLevel(answers) {
  const recent = answers.slice(-WINDOW);
  if (!recent.length) return null;
  const st = stats(recent);
  let best = null;
  for (const l of LEVELS) { const s = st[l]; if (s && s.n >= 3 && s.ok / s.n >= 0.6) best = l; }
  if (best) return best;
  const tried = LEVELS.filter((l) => st[l]);
  return tried[0] || LEVELS[START];
}

// ثقة التقدير ومداه: عالية حين يستقر السلّم ويصيب القارئ مستواه بوضوح ويخفق فيما فوقه،
// متوسطة حين يستقر بلا حسم، منخفضة حين لم يستقر أو الأسئلة قليلة (انتهى الوقت مثلاً).
export function confidence(answers) {
  const level = estimateLevel(answers);
  if (!level) return { level: null, confidence: "low", range: [] };
  const i = levelIndex(level);
  const st = stats(answers.slice(-WINDOW));
  const rate = (l) => { const s = st[l]; return s && s.n >= 2 ? s.ok / s.n : null; };
  const stable = span(answers, 8) <= 2;
  const above = rate(LEVELS[i + 1]);
  const here = rate(level) ?? 0;
  let c = "medium";
  if (!stable || answers.length < 8) c = "low";
  else if (answers.length >= GRAMMAR_MIN && here >= 0.7 && (above === null || above <= 0.35 || i === LEVELS.length - 1)) c = "high";
  const lo = i > 0 && here < 0.7 && c !== "high" ? i - 1 : i;
  const hi = i < LEVELS.length - 1 && above !== null && above > 0.35 && c !== "high" ? i + 1 : i;
  return { level, confidence: c, range: [LEVELS[lo], LEVELS[hi]] };
}

// اختيار مقاطع القراءة/الاستماع: مقطع بمستوى التقدير وآخر أعلى منه بدرجة (أو أدنى إن كان في القمة).
// يُفضَّل ما لم يره المستخدم في جلسة سابقة، والاختيار عشوائي بين المرشحين.
export function pickTwo(pool, level, seen = new Set(), rnd = Math.random) {
  const i = levelIndex(level);
  const fresh = (list) => (list.some((p) => !seen.has(p.id)) ? list.filter((p) => !seen.has(p.id)) : list);
  const at = (k, not) => fresh(pool.filter((p) => levelIndex(p.level) === k && p !== not));
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const first = pick(at(i)) || pool[0];
  const second = pick(at(Math.min(LEVELS.length - 1, i + 1), first)) || pick(at(Math.max(0, i - 1), first)) || pool.find((p) => p !== first);
  return [first, second].filter(Boolean);
}

// مستوى جزء القراءة/الاستماع: أعلى مقطع أصاب فيه 60% فأكثر، وإلا مستوى أدنى من أسهل مقطع
export function partLevel(part, pool) {
  const byId = new Map(pool.map((p) => [p.id, p]));
  let best = null;
  let lowest = null;
  for (const id of part.ids) {
    const p = byId.get(id);
    if (!p) continue;
    const ans = part.answers.filter((a) => a.itemId.startsWith(`${id}#`));
    const ok = ans.filter((a) => a.correct).length;
    if (lowest === null || levelIndex(p.level) < levelIndex(lowest)) lowest = p.level;
    if (ans.length && ok / ans.length >= 0.6 && (best === null || levelIndex(p.level) > levelIndex(best))) best = p.level;
  }
  if (best) return best;
  return lowest ? LEVELS[Math.max(0, levelIndex(lowest) - 1)] : null;
}

// النتيجة النهائية: وسيط مستويات الأجزاء، والكتابة (إن صُحّحت) تُزيح نصف درجة
export function overall({ grammar, reading, listening, writing }) {
  const parts = [grammar, reading, listening].filter(Boolean).map(levelIndex).sort((a, b) => a - b);
  if (!parts.length) return null;
  let idx = parts[Math.floor(parts.length / 2)];
  if (writing) { const w = levelIndex(writing); if (w > idx + 1) idx += 1; else if (w < idx - 1) idx -= 1; }
  const level = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, idx))];
  return { level, ...BANDS[level], parts: { grammar, reading, listening, writing: writing || null } };
}

// التوصية: من أين يبدأ
export function recommend(level) {
  const i = levelIndex(level);
  if (i <= 1) return { track: "general", text: "ابدأ بمسار الإنجليزية العامة: القواعد الأساسية والمفردات اليومية أولاً، والامتحانات بعد بلوغ B1." };
  if (i === 2) return { track: "general-plus", text: "أنت في B1: مسار الإنجليزية العامة بجرعة مكثفة من المفردات الأكاديمية، ثم الآيلتس بعد شهرين تقريباً." };
  if (i === 3) return { track: "ielts", text: "أنت في B2: ادخل مسار الآيلتس أو التوفل مباشرة، وركّز على الكتابة والمحادثة فهما ما يفصل 6 عن 7." };
  return { track: "ielts", text: "أنت في C1: مسار الامتحان مباشرة، بتدريب على الوقت وأنواع الأسئلة أكثر من اللغة نفسها." };
}
