import { DOMAIN_IDS, CENTER_COUNT, UNITS_PER_RING, XP_LESSON, XP_QUIZ, XP_THREAD, PASS_RATIO, THREADS, BADGES } from "../data/curriculum.js";
import { uid } from "./units.js";

// إحصاءات مشتقة من خريطة التقدم { unitId: { score, total, perfect, sim } }
export function stats(progress) {
  const ids = Object.keys(progress);
  const units = ids.length;
  const perfects = ids.filter((k) => progress[k].perfect).length;
  const centerDone = Array.from({ length: CENTER_COUNT }).every((_, i) => progress[`center-${i + 1}`]);
  const domainsTouched = new Set(ids.filter((k) => !k.startsWith("center")).map((k) => k.split("-")[0])).size;
  const sectors = DOMAIN_IDS.filter((d) => Array.from({ length: UNITS_PER_RING }).every((_, i) => progress[uid(d, 0, i)])).length;
  const ring1Done = sectors === DOMAIN_IDS.length && centerDone;
  const threads = THREADS.filter(([a, b]) => progress[a] && progress[b]).length;
  return { units, perfects, centerDone, domainsTouched, sectors, ring1Done, threads };
}

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// السلسلة: عدد الأيام المتتالية المنتهية باليوم أو بالأمس
export function streakFrom(studied) {
  const set = new Set(studied);
  const cursor = new Date();
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
  return n;
}

// يحسب نتيجة إنهاء وحدة على حالة معيّنة ويعيد الحالة الجديدة والنتيجة (دالة نقية)
export function applyFinish(state, { unitId, ring, correct, total, sim }) {
  const passed = correct / total >= PASS_RATIO;
  const first = !((state.attempts || {})[unitId] > 0);
  const fresh = !state.progress[unitId];
  const perfect = passed && correct === total && first;
  const breakdown = [];
  let gain = 0;
  if (passed && fresh) {
    breakdown.push(["إكمال الدرس", XP_LESSON[ring]]); gain += XP_LESSON[ring];
    breakdown.push(["اجتياز الاختبار", XP_QUIZ[ring]]); gain += XP_QUIZ[ring];
    if (perfect) { breakdown.push(["علامة كاملة من أول محاولة", XP_QUIZ[ring]]); gain += XP_QUIZ[ring]; }
  }
  const progress = passed ? { ...state.progress, [unitId]: { score: correct, total, perfect, sim } } : state.progress;
  const newThreads = [];
  if (passed && fresh) {
    THREADS.forEach(([a, b]) => {
      if ((a === unitId || b === unitId) && progress[a] && progress[b]) {
        newThreads.push(a + b); gain += XP_THREAD; breakdown.push(["خيط معرفة مكتمل", XP_THREAD]);
      }
    });
  }
  const st = stats(progress);
  const newBadges = BADGES.filter((b) => !state.badges.includes(b.id) && b.test(st)).map((b) => b.id);
  const today = dayKey();
  const studied = passed && !state.studied.includes(today) ? [...state.studied, today] : state.studied;
  const next = {
    progress,
    attempts: { ...(state.attempts || {}), [unitId]: ((state.attempts || {})[unitId] || 0) + 1 },
    xp: state.xp + gain,
    weeklyXp: state.weeklyXp + gain,
    badges: [...state.badges, ...newBadges],
    studied,
    streak: streakFrom(studied),
  };
  const result = { unitId, correct, total, passed, gain, breakdown, newBadges, newThreads, sim, fresh, xpBefore: state.xp };
  return { next, result };
}
