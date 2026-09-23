import QuranMemo from "./quranMemo.model.js";
import { plainMap } from "../../shared/utils/models.js";
import { SURAS, suraAyahs, juzAyahs, pageAyahs, key } from "../../shared/data/quran/index.js";

// جدول المراجعة للآيات: مراحل تتباعد، والزلّة تعيد الآية إلى البداية.
// آية أُتقنت خمس مرات تبتعد ثلاثة أشهر؛ آية أخطأت فيها ترجع غداً.
export const INTERVALS = [1, 3, 7, 14, 30, 90];
const DAY = 864e5;

// آيات الهدف بترتيب المصحف
export function goalAyahs(goal) {
  if (!goal) return [];
  const range = Array.from({ length: goal.to - goal.from + 1 }, (_, i) => goal.from + i);
  if (goal.kind === "sura") return range.flatMap(suraAyahs);
  if (goal.kind === "juz") return range.flatMap(juzAyahs);
  return range.flatMap(pageAyahs);
}

export async function get(userId) {
  const doc = await QuranMemo.findOne({ user: userId }).lean();
  return { goal: doc?.goal || null, items: plainMap(doc?.items), sessions: doc?.sessions || [] };
}

export async function setGoal(userId, goal) {
  const doc = await QuranMemo.findOneAndUpdate({ user: userId }, { $set: { goal } }, { new: true, upsert: true, runValidators: true }).lean();
  return { goal: doc.goal, items: plainMap(doc.items), sessions: doc.sessions || [] };
}

// نتيجة تسميع آية: صحيحة تتقدّم مرحلة، خاطئة ترجع إلى الأولى وتُعدّ زلّة
export async function review(userId, s, a, correct) {
  const k = key(s, a);
  const doc = (await QuranMemo.findOne({ user: userId })) || new QuranMemo({ user: userId });
  const cur = doc.items.get(k) || { stage: 0, reps: 0, lapses: 0 };
  const stage = correct ? Math.min((cur.reps ? cur.stage + 1 : 0), INTERVALS.length - 1) : 0;
  const next = { stage, reps: cur.reps + 1, lapses: cur.lapses + (correct ? 0 : 1), last: new Date(), due: new Date(Date.now() + INTERVALS[stage] * DAY) };
  doc.items.set(k, next);
  await doc.save();
  return { key: k, ...next };
}

export async function logSession(userId, withWhom, ayahs) {
  const doc = await QuranMemo.findOneAndUpdate({ user: userId }, { $push: { sessions: { at: new Date(), with: withWhom, ayahs } } }, { new: true, upsert: true }).lean();
  return doc.sessions;
}

// جرعة اليوم: ما حان موعد مراجعته، ثم آيات جديدة من الهدف بقدر الجرعة اليومية
export function today({ goal, items }, now = Date.now()) {
  const all = goalAyahs(goal);
  const due = Object.entries(items).filter(([, it]) => new Date(it.due).getTime() <= now).map(([k]) => k);
  const learned = new Set(Object.keys(items));
  const fresh = all.filter((x) => !learned.has(key(x.s, x.a))).slice(0, goal?.perDay || 0).map((x) => key(x.s, x.a));
  const memorized = all.filter((x) => (items[key(x.s, x.a)]?.stage || 0) >= 2).length;
  return { due, fresh, total: all.length, started: all.filter((x) => learned.has(key(x.s, x.a))).length, memorized };
}

// خريطة الأجزاء: كم آية بدأ منها في كل جزء وكم أتقن
export function juzMap(items) {
  return Array.from({ length: 30 }, (_, i) => {
    const ayahs = juzAyahs(i + 1);
    const started = ayahs.filter((x) => items[key(x.s, x.a)]).length;
    const strong = ayahs.filter((x) => (items[key(x.s, x.a)]?.stage || 0) >= 2).length;
    return { juz: i + 1, total: ayahs.length, started, strong };
  });
}

export const suraOf = (n) => SURAS.find((s) => s.n === Number(n)) || null;
