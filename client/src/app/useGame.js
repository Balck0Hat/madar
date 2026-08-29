import { useState, useCallback } from "react";
import { authService } from "../features/auth";
import { progressService } from "../features/progress";

const EMPTY = { progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], streak: 0 };
const toProfile = (user) => ({ id: user.id, name: user.name, email: user.email, minutes: user.settings.minutes, fav: user.settings.fav, arabicNums: user.settings.arabicNums });

// حالة اللعبة المخزَّنة على الخادم؛ هذا الملف هو الوحيد الذي يستدعي خدمات الحساب والتقدم
export function useGame() {
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [threadsNew, setThreadsNew] = useState([]);

  // عند فتح التطبيق: هل توجد جلسة؟
  const boot = useCallback(async () => {
    try {
      const user = await authService.me();
      const st = await progressService.getState();
      setProfile(toProfile(user));
      setState(st);
      return true;
    } catch (err) {
      if (err.status === 401 || err.status === 0) return false;
      throw err;
    }
  }, []);

  const signIn = useCallback(async (user) => {
    setProfile(toProfile(user));
    setState(await progressService.getState());
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setProfile(null); setState(EMPTY); setResult(null); setThreadsNew([]);
  }, []);

  const updateSettings = useCallback(async (fields) => {
    const user = await authService.updateMe(fields);
    setProfile(toProfile(user));
  }, []);

  const finishUnit = useCallback(async (unitId, correct, total, sim = false) => {
    const { state: st, result: r } = await progressService.finishUnit(unitId, { correct, total, sim });
    setState(st);
    setThreadsNew(r.newThreads);
    setResult(r);
    return r;
  }, []);

  const simulate = useCallback((unitId) => finishUnit(unitId, 7 + Math.floor(Math.random() * 4), 10, true), [finishUnit]);

  return { profile, ...state, result, threadsNew, boot, signIn, signOut, updateSettings, finishUnit, simulate };
}
