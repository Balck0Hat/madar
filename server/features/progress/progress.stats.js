import Progress from "./progress.model.js";
import { plainMap } from "../../shared/utils/models.js";
import { parseUnitId } from "../../shared/utils/units.js";
import { DOMAIN_IDS, UNITS_PER_RING, XP_LESSON, XP_QUIZ } from "../../shared/data/curriculum.js";
import { weekKey } from "../../shared/utils/week.js";

const WEEKS = 8;
// تقدير: لا نقيس زمن الدراسة فعلياً، فنشتق دقائق تقريبية من مدار الوحدة
const MINUTES_PER_RING = [10, 15, 20];

// مفتاح اليوم في السجل هو `${سنة}-${شهر من صفر}-${يوم}` كما يولّده game.dayKey
const dayToDate = (key) => {
  const [y, m, d] = String(key).split("-").map(Number);
  return new Date(y, m, d);
};

// آخر ثمانية أسابيع من الأقدم إلى الأحدث، مع إظهار الأسابيع الخالية بصفر
function weeklySeries(xpLog = []) {
  const now = Date.now();
  const keys = Array.from({ length: WEEKS }, (_, i) => weekKey(new Date(now - (WEEKS - 1 - i) * 7 * 864e5)));
  const sums = new Map(keys.map((k) => [k, 0]));
  for (const { day, amount } of xpLog) {
    const k = weekKey(dayToDate(day));
    if (sums.has(k)) sums.set(k, sums.get(k) + amount);
  }
  return keys.map((week) => ({ week, xp: sums.get(week) }));
}

// نقاط المجال تُشتق من الوحدات المكتملة (لا نخزّنها) — نفس معادلة applyFinish
function domainRows(progress) {
  const rows = DOMAIN_IDS.map((domain) => ({ domain, done: 0, total: UNITS_PER_RING, xp: 0 }));
  const byId = new Map(rows.map((r) => [r.domain, r]));
  for (const [unitId, res] of Object.entries(progress)) {
    const parsed = parseUnitId(unitId);
    const row = parsed && !parsed.center ? byId.get(parsed.domain) : null;
    if (!row) continue;
    // العدّاد للمدار الأول وحده كي يبقى done ضمن total
    if (parsed.ring === 0) row.done += 1;
    row.xp += XP_LESSON[parsed.ring] + XP_QUIZ[parsed.ring] + (res.perfect ? XP_QUIZ[parsed.ring] : 0);
  }
  return rows;
}

export async function personalStats(userId) {
  const doc = await Progress.findOne({ user: userId }).lean();
  const progress = doc ? plainMap(doc.progress) : {};
  const rows = domainRows(progress);
  // الأقوى والأضعف بين المجالات التي بدأها المستخدم فقط؛ مقارنة غير المبدوء بلا معنى
  const touched = rows.filter((r) => r.done || r.xp).sort((a, b) => b.xp - a.xp || b.done - a.done);
  const results = Object.values(progress);
  const correct = results.reduce((n, r) => n + (r.score || 0), 0);
  const asked = results.reduce((n, r) => n + (r.total || 0), 0);
  const totalMinutes = Object.keys(progress).reduce((n, id) => n + MINUTES_PER_RING[parseUnitId(id)?.ring ?? 0], 0);
  return {
    weeks: weeklySeries(doc?.xpLog),
    byDomain: rows,
    strongest: touched[0]?.domain || null,
    weakest: touched[touched.length - 1]?.domain || null,
    totalMinutes,
    quizAccuracy: asked ? Math.round((correct / asked) * 100) : 0,
  };
}
