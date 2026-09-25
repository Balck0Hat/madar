import { LEVELS, levelIndex, BANDS } from "../../shared/data/english/index.js";

// منطق اختبار المستوى، خالٍ من قاعدة البيانات ليُختبر وحده.
export const GRAMMAR_ITEMS = 20;
const START = 2; // B1
const WINDOW = 12; // آخر كم إجابة تدخل في التقدير

// السلّم التكيّفي: إجابتان صحيحتان متتاليتان تصعد مستوى، وخطأ واحد ينزل مستوى
export function nextLevel(answers) {
  let level = START;
  let streak = 0;
  for (const a of answers) {
    if (a.correct) { streak++; if (streak >= 2) { level = Math.min(LEVELS.length - 1, level + 1); streak = 0; } }
    else { level = Math.max(0, level - 1); streak = 0; }
  }
  return LEVELS[level];
}

// المستوى المقدَّر من الإجابات: أعلى مستوى أصاب فيه القارئ 60% فأكثر من ثلاثة أسئلة فأكثر،
// وإلا أدنى مستوى حاوله. تُؤخذ آخر 12 إجابة لأن البداية استكشاف.
export function estimateLevel(answers) {
  const recent = answers.slice(-WINDOW);
  if (!recent.length) return null;
  const stats = {};
  for (const a of recent) { const s = stats[a.level] || (stats[a.level] = { n: 0, ok: 0 }); s.n++; if (a.correct) s.ok++; }
  let best = null;
  for (const l of LEVELS) { const s = stats[l]; if (s && s.n >= 3 && s.ok / s.n >= 0.6) best = l; }
  if (best) return best;
  const tried = LEVELS.filter((l) => stats[l]);
  return tried[0] || LEVELS[START];
}

// اختيار مقاطع القراءة/الاستماع: مقطع بمستوى التقدير وآخر أعلى منه بدرجة (أو أدنى إن كان في القمة)
export function pickTwo(pool, level) {
  const i = levelIndex(level);
  const at = (k) => pool.filter((p) => levelIndex(p.level) === k);
  const first = at(i)[0] || pool[0];
  const second = at(Math.min(LEVELS.length - 1, i + 1)).find((p) => p !== first) || at(Math.max(0, i - 1)).find((p) => p !== first) || pool.find((p) => p !== first);
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
