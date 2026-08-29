import { useState } from "react";
import { XP_LESSON, XP_QUIZ, XP_THREAD, THREADS, BADGES } from "../shared/data/curriculum";
import { unitInfo } from "../shared/utils/units";
import { stats } from "../shared/utils/progress";
import { todayKey } from "../shared/utils/text";
import { isPassed } from "../features/quiz";

// حالة اللعبة كلها (في الذاكرة فقط في هذا النموذج الأولي)
export function useGame() {
  const [profile, setProfile] = useState({ name: "زائر", minutes: 30, fav: "human" });
  const [progress, setProgress] = useState({});
  const [attempts, setAttempts] = useState({});
  const [xp, setXp] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [threadsNew, setThreadsNew] = useState([]);
  const [streak, setStreak] = useState(0);
  const [studied, setStudied] = useState([]);
  const [result, setResult] = useState(null);

  // يحسب النقاط والخيوط والأوسمة لوحدة انتهى اختبارها ويحدّث الحالة
  function finishUnit(unitId, correct, total, sim = false) {
    const r = unitInfo(unitId).ring;
    const passed = isPassed(correct, total);
    const first = !(attempts[unitId] > 0);
    const fresh = !progress[unitId];
    setAttempts((a) => ({ ...a, [unitId]: (a[unitId] || 0) + 1 }));

    const breakdown = [];
    let gain = 0;
    const perfect = passed && correct === total && first;
    if (passed && fresh) {
      breakdown.push(["إكمال الدرس", XP_LESSON[r]]); gain += XP_LESSON[r];
      breakdown.push(["اجتياز الاختبار", XP_QUIZ[r]]); gain += XP_QUIZ[r];
      if (perfect) { breakdown.push(["علامة كاملة من أول محاولة", XP_QUIZ[r]]); gain += XP_QUIZ[r]; }
    }

    let np = progress;
    const newThreads = [];
    if (passed) {
      np = { ...progress, [unitId]: { score: correct, total, perfect, sim } };
      if (fresh) {
        THREADS.forEach(([a, b]) => {
          if ((a === unitId || b === unitId) && np[a] && np[b]) {
            newThreads.push(a + b); gain += XP_THREAD; breakdown.push(["خيط معرفة مكتمل", XP_THREAD]);
          }
        });
      }
      setProgress(np);
      const key = todayKey();
      setStudied((s) => (s.includes(key) ? s : [...s, key]));
      setStreak((s) => Math.max(1, s));
    }

    const newBadges = BADGES.filter((b) => !badges.includes(b.id) && b.test(stats(np))).map((b) => b.id);
    if (newBadges.length) setBadges((bs) => [...bs, ...newBadges]);

    const xpBefore = xp;
    setXp(xpBefore + gain);
    setWeeklyXp((w) => w + gain);
    setThreadsNew(newThreads);
    setResult({ unitId, correct, total, passed, gain, breakdown, newBadges, newThreads, sim, fresh, xpBefore });
    return gain;
  }

  // محاكاة وحدة غير مكتوبة: نتيجة عشوائية بين 7 و 10
  const simulate = (unitId) => finishUnit(unitId, 7 + Math.floor(Math.random() * 4), 10, true);

  return { profile, setProfile, progress, xp, weeklyXp, badges, threadsNew, streak, studied, result, finishUnit, simulate };
}
