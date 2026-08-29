import { useState, useCallback, useRef } from "react";
import { authService } from "../features/auth";
import { progressService } from "../features/progress";
import { contentService } from "../features/content";
import { reviewService } from "../features/review";
import { examService } from "../features/exam";
import { DOMAINS } from "../shared/data/domains";
import { uid } from "../shared/utils/units";

const EMPTY = { progress: {}, attempts: {}, resume: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], frozenDays: [], freezes: 0, streak: 0, lastLeague: null };
const toProfile = (u) => ({
  id: u.id, name: u.name, email: u.email, handle: u.handle, role: u.role, tier: u.tier,
  minutes: u.settings.minutes, fav: u.settings.fav, arabicNums: u.settings.arabicNums,
  reminders: u.settings.reminders, calm: Boolean(u.settings.calm), readMode: u.settings.readMode ?? "cards", theme: u.settings.theme ?? "system", fontScale: u.settings.fontScale ?? 1,
});
const quiet = (p) => p.catch(() => null);

// القطاعات المكتملة في المدار الأول (لكشف لحظة اكتمال قطاع جديد)
const doneSectors = (progress) => DOMAINS.filter((d) => d.rings[0].every((_, i) => progress[uid(d.id, 0, i)])).map((d) => d.id);

// حالة اللعبة المخزَّنة على الخادم؛ هذا الملف هو الوحيد الذي يستدعي خدمات الحساب والتقدم
export function useGame() {
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [threadsNew, setThreadsNew] = useState([]);
  const [authored, setAuthored] = useState([]);
  const [reviewDue, setReviewDue] = useState(0);
  const [certificate, setCertificate] = useState(null);
  const [newSector, setNewSector] = useState(null);
  const sectors = useRef([]);

  const hydrate = useCallback(async () => {
    const [st, ids, due, exam] = await Promise.all([
      progressService.getState(), quiet(contentService.listAuthoredIds()), quiet(reviewService.getDue()), quiet(examService.getStatus()),
    ]);
    setState({ ...EMPTY, ...st });
    sectors.current = doneSectors(st.progress || {});
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
    setProfile(null); setState(EMPTY); setResult(null); setThreadsNew([]); setReviewDue(0); setCertificate(null); setNewSector(null);
    sectors.current = [];
  }, []);

  // تحديث الإعدادات تفاؤلياً: السمة وحجم الخط يجب أن يستجيبا فوراً
  const updateSettings = useCallback(async (fields) => {
    setProfile((p) => (p ? { ...p, ...fields } : p));
    try { setProfile(toProfile(await authService.updateMe(fields))); } catch (err) { await quiet(authService.me().then((u) => setProfile(toProfile(u)))); throw err; }
  }, []);

  const finishUnit = useCallback(async (unitId, payload) => {
    const { state: st, result: r } = await progressService.finishUnit(unitId, payload);
    setState({ ...EMPTY, ...st });
    setThreadsNew(r.newThreads);
    setResult(r);
    const after = doneSectors(st.progress || {});
    const fresh = after.find((d) => !sectors.current.includes(d));
    sectors.current = after;
    if (fresh) setNewSector(fresh);
    quiet(reviewService.getDue()).then((d) => d && setReviewDue(d.totalDue));
    return r;
  }, []);

  const simulate = useCallback((unitId) => finishUnit(unitId, { correct: 7 + Math.floor(Math.random() * 4), total: 10, sim: true }), [finishUnit]);
  const saveResume = useCallback((unitId, card) => quiet(progressService.saveResume(unitId, card)), []);
  const refreshAuthored = useCallback(async () => { const ids = await quiet(contentService.listAuthoredIds()); if (ids) setAuthored(ids); }, []);
  const refresh = useCallback(() => quiet(hydrate()), [hydrate]);

  return {
    profile, ...state, result, threadsNew, authored, reviewDue, certificate, newSector,
    setCertificate, clearSector: () => setNewSector(null),
    boot, signIn, signOut, updateSettings, finishUnit, simulate, saveResume, refresh, refreshAuthored,
  };
}
