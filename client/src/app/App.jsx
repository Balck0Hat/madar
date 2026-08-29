import { useState, useEffect } from "react";
import { C, P, FONT } from "../shared/constants/theme";
import { CONTENT } from "../shared/data/content";
import { nextUnit } from "../shared/utils/progress";
import { isCenter } from "../shared/utils/units";
import { NumCtx } from "../shared/context/NumContext";
import { CSS } from "../shared/styles/global";
import { TabBar, Toast, OrbitMark } from "../shared/components/ui";
import { Landing, Onboarding } from "../features/onboarding";
import { AuthScreen } from "../features/auth";
import { MapScreen } from "../features/map";
import { DomainScreen } from "../features/domain";
import { UnitScreen } from "../features/unit";
import { QuizScreen, ResultScreen } from "../features/quiz";
import { LeagueScreen } from "../features/league";
import { ProfileScreen } from "../features/profile";
import { useGame } from "./useGame";

const TABS = ["map", "league", "me"];

export default function App() {
  const game = useGame();
  const { profile, progress, xp, weeklyXp, badges, threadsNew, streak, studied, result } = game;
  const [screen, setScreen] = useState("boot");
  const [authMode, setAuthMode] = useState("register");
  const [cur, setCur] = useState({ domain: "human", ring: 0, unit: null });
  const [toast, setToast] = useState("");

  useEffect(() => {
    game.boot().then((ok) => setScreen(ok ? "map" : "landing")).catch((err) => { setToast(err.message); setScreen("landing"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  // كل استدعاء للخادم يمرّ من هنا ليُعرض خطؤه كتنبيه بدل أن يضيع
  const guard = (fn) => async (...args) => { try { return await fn(...args); } catch (err) { setToast(err.message); return undefined; } };
  const openDomain = (id, r = 0) => { setCur((c) => ({ ...c, domain: id, ring: r })); setScreen("domain"); };
  const openUnit = (id) => { setCur((c) => ({ ...c, unit: id })); setScreen("unit"); };
  const openAuth = (mode) => { setAuthMode(mode); setScreen("auth"); };
  const finish = guard(async (unitId, correct, total, sim) => {
    const r = await game.finishUnit(unitId, correct, total, sim);
    if (r.gain > 0) setToast(`+${r.gain} XP`);
    setScreen("result");
  });
  const onAuthed = guard(async (user, isNew) => { await game.signIn(user); setScreen(isNew ? "onboarding" : "map"); });
  const onOnboarded = guard(async ({ minutes, fav }) => { await game.updateSettings({ minutes, fav }); setScreen("map"); setToast(`أهلاً ${profile.name}، ابدأ من المركز`); });
  const onLogout = guard(async () => { await game.signOut(); setScreen("landing"); });
  const onToggleNums = guard((v) => game.updateSettings({ arabicNums: v }));

  const next = profile ? nextUnit(progress, profile.fav) : null;
  const paper = screen === "unit" && Boolean(CONTENT[cur.unit]);

  return (
    <NumCtx.Provider value={Boolean(profile?.arabicNums)}>
      <div className="madar" dir="rtl" style={{ minHeight: "100vh", background: paper ? P.bg : C.bg, color: paper ? P.ink : C.text, fontFamily: FONT, display: "flex", justifyContent: "center", transition: "background .4s" }}>
        <style>{CSS}</style>
        <main style={{ width: "100%", maxWidth: 430, minHeight: "100vh", position: "relative" }}>
          {screen === "boot" && <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><OrbitMark size={80} /></div>}
          {screen === "landing" && <Landing onStart={() => openAuth("register")} onLogin={() => openAuth("login")} />}
          {screen === "auth" && <AuthScreen mode={authMode} onBack={() => setScreen("landing")} onAuthed={onAuthed} />}
          {screen === "onboarding" && profile && <Onboarding name={profile.name} onDone={onOnboarded} />}
          {screen === "map" && profile && <MapScreen profile={profile} progress={progress} xp={xp} streak={streak} weeklyXp={weeklyXp} onOpenDomain={openDomain} onOpenUnit={openUnit} onProfile={() => setScreen("me")} threadsNew={threadsNew} />}
          {screen === "domain" && <DomainScreen domainId={cur.domain} ringIdx={cur.ring} progress={progress} onBack={() => setScreen("map")} onOpenUnit={openUnit} onRing={(r) => setCur((c) => ({ ...c, ring: r }))} />}
          {screen === "unit" && <UnitScreen key={cur.unit} unitId={cur.unit} onBack={() => setScreen(isCenter(cur.unit) ? "map" : "domain")} onStartQuiz={() => setScreen("quiz")} onSimulate={() => finish(cur.unit, 7 + Math.floor(Math.random() * 4), 10, true)} />}
          {screen === "quiz" && <QuizScreen key={cur.unit} unitId={cur.unit} questions={CONTENT[cur.unit].quiz} onBack={() => setScreen("unit")} onFinish={(c, t) => finish(cur.unit, c, t, false)} />}
          {screen === "result" && result && <ResultScreen key={result.unitId + xp} result={result} xp={xp} progress={progress} hasNext={Boolean(next)} onMap={() => setScreen("map")} onNext={() => openUnit(next)} />}
          {screen === "league" && profile && <LeagueScreen profile={profile} weeklyXp={weeklyXp} />}
          {screen === "me" && profile && <ProfileScreen profile={profile} progress={progress} xp={xp} badges={badges} streak={streak} studied={studied} arabicNums={profile.arabicNums} onToggleNums={onToggleNums} onToast={setToast} onLogout={onLogout} />}
          {TABS.includes(screen) && <TabBar tab={screen} onTab={setScreen} />}
          <Toast msg={toast} />
        </main>
      </div>
    </NumCtx.Provider>
  );
}
