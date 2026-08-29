import { DOMAIN_IDS, CENTER_COUNT, UNITS_PER_RING, XP_LESSON, XP_QUIZ, XP_THREAD, PASS_RATIO, THREADS, BADGES } from "../data/curriculum.js";
import { uid } from "./units.js";

export const MAX_FREEZES = 2;

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
export const daysAgoKey = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };

// السلسلة: أيام متتالية (دراسة أو تجميد) تنتهي باليوم أو بالأمس
export function streakFrom(studied, frozen = []) {
  const set = new Set([...studied, ...frozen]);
  const cursor = new Date();
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
  return n;
}

// يستهلك تجميداً لإنقاذ السلسلة إذا فات الأمس والذي قبله كان يوم دراسة (دالة نقية)
export function applyFreeze(state) {
  const { studied, frozenDays = [], freezes = 0 } = state;
  const all = new Set([...studied, ...frozenDays]);
  const yesterday = daysAgoKey(1), before = daysAgoKey(2);
  if (all.has(dayKey()) || all.has(yesterday) || !all.has(before) || freezes <= 0) return state;
  return { ...state, frozenDays: [...frozenDays, yesterday], freezes: freezes - 1, streak: streakFrom(studied, [...frozenDays, yesterday]) };
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
  const newDay = passed && !state.studied.includes(today);
  const studied = newDay ? [...state.studied, today] : state.studied;
  const frozenDays = state.frozenDays || [];
  const streak = streakFrom(studied, frozenDays);
  // كل 7 أيام متتالية تمنح تجميداً (بحد أقصى اثنين)
  const earnedFreeze = newDay && streak > 0 && streak % 7 === 0 && (state.freezes || 0) < MAX_FREEZES;
  const next = {
    ...state,
    progress,
    attempts: { ...(state.attempts || {}), [unitId]: ((state.attempts || {})[unitId] || 0) + 1 },
    xp: state.xp + gain,
    weeklyXp: state.weeklyXp + gain,
    badges: [...state.badges, ...newBadges],
    studied,
    streak,
    freezes: (state.freezes || 0) + (earnedFreeze ? 1 : 0),
  };
  const result = { unitId, correct, total, passed, gain, breakdown, newBadges, newThreads, sim, fresh, xpBefore: state.xp, earnedFreeze };
  return { next, result };
}
