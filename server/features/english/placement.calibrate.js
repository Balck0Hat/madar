import ItemStat from "./itemStat.model.js";
import { LEVELS, levelIndex } from "../../shared/data/english/index.js";

// معايرة بنك الأسئلة من بيانات المستخدمين. الأسئلة كُتبت بحسب وصف المستويات لا
// من امتحان مقنّن، فتُصحَّح مستوياتها بالتجربة: بعد 30 إجابة فأكثر، إن أصاب أقل من
// 35% رُفع السؤال درجة، وإن أصاب أكثر من 90% أُنزل درجة. النتيجة تُخزَّن في override
// وتُقرأ في الذاكرة عند الإقلاع وبعد كل معايرة.
export const MIN_ASKED = 30;
const HARD = 0.35, EASY = 0.9;

const overrides = new Map();
let loaded = false;

export const effectiveLevel = (item) => overrides.get(item.id) || item.level;

export async function loadOverrides() {
  overrides.clear();
  const rows = await ItemStat.find({ override: { $ne: null } }).select("itemId override").lean();
  for (const r of rows) overrides.set(r.itemId, r.override);
  loaded = true;
  return overrides.size;
}
export const ensureOverrides = () => (loaded ? Promise.resolve(overrides.size) : loadOverrides());
export const resetOverrides = () => { overrides.clear(); loaded = false; };

// تسجيل إجابة (تُستدعى بعد كل سؤال)
export const record = (itemId, level, correct) => ItemStat.updateOne({ itemId }, { $setOnInsert: { level }, $inc: { asked: 1, correct: correct ? 1 : 0 } }, { upsert: true });

export function calibratedLevel(stat) {
  if (stat.asked < MIN_ASKED) return null;
  const rate = stat.correct / stat.asked;
  const i = levelIndex(stat.level);
  if (rate < HARD && i < LEVELS.length - 1) return LEVELS[i + 1];
  if (rate > EASY && i > 0) return LEVELS[i - 1];
  return null;
}

let lastRun = null;

// لوحة المشرف: ما تغيّر مستواه، وما يخطئ فيه الجميع أو يصيبه الجميع (ولو قبل بلوغ الحد)، وكم سُئل كل مستوى
export async function summary(items) {
  const rows = await ItemStat.find().lean();
  const byId = new Map(items.map((i) => [i.id, i]));
  const row = (r) => ({ itemId: r.itemId, level: r.level, override: r.override, asked: r.asked, rate: Math.round((r.correct / r.asked) * 100), q: byId.get(r.itemId)?.q || null });
  const asked = rows.filter((r) => r.asked >= 10);
  const perLevel = {};
  for (const r of rows) { const s = perLevel[r.level] || (perLevel[r.level] = { asked: 0, items: 0 }); s.asked += r.asked; s.items++; }
  return {
    lastRun, minAsked: MIN_ASKED, active: overrides.size, tracked: rows.length, perLevel,
    overridden: rows.filter((r) => r.override).map(row),
    hardest: asked.filter((r) => r.correct / r.asked < HARD).sort((a, b) => a.correct / a.asked - b.correct / b.asked).slice(0, 15).map(row),
    easiest: asked.filter((r) => r.correct / r.asked > EASY).sort((a, b) => b.correct / b.asked - a.correct / a.asked).slice(0, 15).map(row),
  };
}

// المعايرة الليلية: تحسب override لكل سؤال بلغ الحد، وتعيد ملخصاً للسجل
export async function calibrate() {
  lastRun = new Date();
  const rows = await ItemStat.find({ asked: { $gte: MIN_ASKED } }).lean();
  const ops = [];
  let up = 0, down = 0;
  for (const r of rows) {
    const next = calibratedLevel(r);
    if ((r.override || null) === next) continue;
    if (next && levelIndex(next) > levelIndex(r.level)) up++; else if (next) down++;
    ops.push({ updateOne: { filter: { _id: r._id }, update: { $set: { override: next } } } });
  }
  if (ops.length) await ItemStat.bulkWrite(ops);
  await loadOverrides();
  return { reviewed: rows.length, changed: ops.length, up, down, active: overrides.size };
}
