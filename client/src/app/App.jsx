import { useState, useEffect } from "react";
import { C, P, FONT } from "../shared/constants/theme";
import { nextUnit } from "../shared/utils/progress";
import { isCenter } from "../shared/utils/units";
import { NumCtx } from "../shared/context/NumContext";
import { CSS } from "../shared/styles/global";
import { TabBar, Toast, OrbitMark } from "../shared/components/ui";
import { Landing, Onboarding } from "../features/onboarding";
import { AuthScreen, authService } from "../features/auth";
import { MapScreen } from "../features/map";
import { DomainScreen } from "../features/domain";
import { UnitScreen } from "../features/unit";
import { QuizScreen, ResultScreen } from "../features/quiz";
import { LeagueScreen } from "../features/league";
import { ProfileScreen } from "../features/profile";
import { ReviewScreen } from "../features/review";
import { ExamScreen, VerifyPage } from "../features/exam";
import { LibraryScreen } from "../features/library";
import { PublicProfile } from "../features/public";
import { AdminScreen } from "../features/admin";
import { useGame } from "./useGame";
import { readRoute, cleanUrl, goHome } from "./routes";

const TABS = ["map", "league", "me"];
const route = readRoute();

export default function App() {
  const game = useGame();
  const { profile, progress, xp, weeklyXp, badges, threadsNew, streak, freezes, studied, result, authored, reviewDue, certificate } = game;
  const [screen, setScreen] = useState(route.publicHandle ? "public" : route.verifyCode ? "verify" : "boot");
  const [authMode, setAuthMode] = useState("register");
  const [providers, setProviders] = useState({ google: false });
  const [cur, setCur] = useState({ domain: "human", ring: 0, unit: null });
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (screen !== "boot") return;
    authService.providers().then(setProviders).catch(() => {});
    game.boot().then((ok) => {
      if (route.authFailed) setToast("تعذّر الدخول بحساب Google");
      setScreen(ok ? (route.isNew ? "onboarding" : route.screen === "review" ? "review" : "map") : "landing");
      cleanUrl();
    }).catch((err) => { setToast(err.message); setScreen("landing"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  // كل استدعاء للخادم يمرّ من هنا ليُعرض خطؤه كتنبيه بدل أن يضيع
  const guard = (fn) => async (...args) => { try { return await fn(...args); } catch (err) { setToast(err.message); return undefined; } };
  const openDomain = (id, r = 0) => { setCur((c) => ({ ...c, domain: id, ring: r })); setScreen("domain"); };
  const openUnit = (id) => { setCur((c) => ({ ...c, unit: id })); setScreen("unit"); };
  const openAuth = (mode) => { setAuthMode(mode); setScreen("auth"); };
  const finish = guard(async (unitId, payload) => { const r = await game.finishUnit(unitId, payload); if (r.gain > 0) setToast(`+${r.gain} XP`); setScreen("result"); });
  const onAuthed = guard(async (user, isNew) => { await game.signIn(user); setScreen(isNew ? "onboarding" : "map"); });
  const onOnboarded = guard(async ({ minutes, fav }) => { await game.updateSettings({ minutes, fav }); setScreen("map"); setToast(`أهلاً ${profile.name}، ابدأ من المركز`); });
  const onLogout = guard(async () => { await game.signOut(); setScreen("landing"); });
  const backToMap = () => { game.refresh(); setScreen("map"); };

  const next = profile ? nextUnit(progress, profile.fav) : null;
  const paper = screen === "unit" && authored.includes(cur.unit);

  return (
    <NumCtx.Provider value={Boolean(profile?.arabicNums)}>
      <div className="madar" dir="rtl" style={{ minHeight: "100vh", background: paper ? P.bg : C.bg, color: paper ? P.ink : C.text, fontFamily: FONT, display: "flex", justifyContent: "center", transition: "background .4s" }}>
        <style>{CSS}</style>
        <main style={{ width: "100%", maxWidth: 430, minHeight: "100vh", position: "relative" }}>
          {screen === "boot" && <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><OrbitMark size={80} /></div>}
          {screen === "public" && <PublicProfile handle={route.publicHandle} onHome={goHome} />}
          {screen === "verify" && <VerifyPage code={route.verifyCode} onHome={goHome} />}
          {screen === "landing" && <Landing onStart={() => openAuth("register")} onLogin={() => openAuth("login")} googleUrl={providers.google ? authService.googleUrl() : null} />}
          {screen === "auth" && <AuthScreen mode={authMode} onBack={() => setScreen("landing")} onAuthed={onAuthed} />}
          {screen === "onboarding" && profile && <Onboarding name={profile.name} onDone={onOnboarded} />}
          {screen === "map" && profile && <MapScreen profile={profile} progress={progress} xp={xp} streak={streak} freezes={freezes} weeklyXp={weeklyXp} reviewDue={reviewDue} onOpenDomain={openDomain} onOpenUnit={openUnit} onProfile={() => setScreen("me")} onReview={() => setScreen("review")} threadsNew={threadsNew} />}
          {screen === "domain" && <DomainScreen domainId={cur.domain} ringIdx={cur.ring} progress={progress} authored={authored} onBack={() => setScreen("map")} onOpenUnit={openUnit} onRing={(r) => setCur((c) => ({ ...c, ring: r }))} />}
          {screen === "unit" && <UnitScreen key={cur.unit} unitId={cur.unit} authored={authored.includes(cur.unit)} onBack={() => setScreen(isCenter(cur.unit) ? "map" : "domain")} onStartQuiz={() => setScreen("quiz")} onSimulate={() => finish(cur.unit, { correct: 7 + Math.floor(Math.random() * 4), total: 10, sim: true })} />}
          {screen === "quiz" && <QuizScreen key={cur.unit} unitId={cur.unit} onBack={() => setScreen("unit")} onFinish={(answers) => finish(cur.unit, { answers })} />}
          {screen === "result" && result && <ResultScreen key={result.unitId + xp} result={result} xp={xp} progress={progress} hasNext={Boolean(next)} onMap={backToMap} onNext={() => openUnit(next)} />}
          {screen === "review" && <ReviewScreen onBack={backToMap} onDone={backToMap} />}
          {screen === "exam" && <ExamScreen onBack={() => { game.refresh(); setScreen("me"); }} onCertified={(c) => game.setCertificate(c)} />}
          {screen === "library" && <LibraryScreen progress={progress} onBack={() => setScreen("me")} onOpenUnit={openUnit} />}
          {screen === "admin" && <AdminScreen onBack={() => setScreen("me")} onToast={setToast} onContentChanged={game.refreshAuthored} />}
          {screen === "league" && profile && <LeagueScreen />}
          {screen === "me" && profile && <ProfileScreen profile={profile} progress={progress} xp={xp} badges={badges} streak={streak} freezes={freezes} studied={studied} certificate={certificate} onToggleNums={guard((v) => game.updateSettings({ arabicNums: v }))} onToggleReminders={(v) => game.updateSettings({ reminders: v })} onToast={setToast} onLogout={onLogout} onLibrary={() => setScreen("library")} onExam={() => setScreen("exam")} onAdmin={() => setScreen("admin")} />}
          {TABS.includes(screen) && <TabBar tab={screen} onTab={setScreen} />}
          <Toast msg={toast} />
        </main>
      </div>
    </NumCtx.Provider>
  );
}
