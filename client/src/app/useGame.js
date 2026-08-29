import { useState, useCallback } from "react";
import { authService } from "../features/auth";
import { progressService } from "../features/progress";
import { contentService } from "../features/content";
import { reviewService } from "../features/review";
import { examService } from "../features/exam";

const EMPTY = { progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], frozenDays: [], freezes: 0, streak: 0, lastLeague: null };
const toProfile = (u) => ({ id: u.id, name: u.name, email: u.email, handle: u.handle, role: u.role, tier: u.tier, minutes: u.settings.minutes, fav: u.settings.fav, arabicNums: u.settings.arabicNums, reminders: u.settings.reminders });
const quiet = (p) => p.catch(() => null);

// حالة اللعبة المخزَّنة على الخادم؛ هذا الملف هو الوحيد الذي يستدعي خدمات الحساب والتقدم
export function useGame() {
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [threadsNew, setThreadsNew] = useState([]);
  const [authored, setAuthored] = useState([]);
  const [reviewDue, setReviewDue] = useState(0);
  const [certificate, setCertificate] = useState(null);

  // ما يُحمَّل مع كل جلسة: التقدم، الوحدات المكتوبة، المراجعات المستحقة، الشهادة
  const hydrate = useCallback(async () => {
    const [st, ids, due, exam] = await Promise.all([progressService.getState(), quiet(contentService.listAuthoredIds()), quiet(reviewService.getDue()), quiet(examService.getStatus())]);
    setState(st);
    if (ids) setAuthored(ids);
    if (due) setReviewDue(due.totalDue);
    if (exam) setCertificate(exam.certificate);
  }, []);

  const boot = useCallback(async () => {
    try {
      const user = await authService.me();
      setProfile(toProfile(user));
      await hydrate();
      return true;
    } catch (err) {
      if (err.status === 401 || err.status === 0) return false;
      throw err;
    }
  }, [hydrate]);

  const signIn = useCallback(async (user) => { setProfile(toProfile(user)); await hydrate(); }, [hydrate]);

  const signOut = useCallback(async () => {
    await authService.logout();
    setProfile(null); setState(EMPTY); setResult(null); setThreadsNew([]); setReviewDue(0); setCertificate(null);
  }, []);

  const updateSettings = useCallback(async (fields) => { setProfile(toProfile(await authService.updateMe(fields))); }, []);

  const finishUnit = useCallback(async (unitId, payload) => {
    const { state: st, result: r } = await progressService.finishUnit(unitId, payload);
    setState(st); setThreadsNew(r.newThreads); setResult(r);
    return r;
  }, []);

  const simulate = useCallback((unitId) => finishUnit(unitId, { correct: 7 + Math.floor(Math.random() * 4), total: 10, sim: true }), [finishUnit]);
  const refreshAuthored = useCallback(async () => { const ids = await quiet(contentService.listAuthoredIds()); if (ids) setAuthored(ids); }, []);
  const refresh = useCallback(() => quiet(hydrate()), [hydrate]);

  return { profile, ...state, result, threadsNew, authored, reviewDue, certificate, setCertificate, boot, signIn, signOut, updateSettings, finishUnit, simulate, refresh, refreshAuthored };
}
