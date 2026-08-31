import { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { C, P, FONT } from "../shared/constants/theme";
import { nextUnit } from "../shared/utils/progress";
import { isCenter } from "../shared/utils/units";
import { PrefsProvider } from "../shared/context/PrefsContext";
import { CSS } from "../shared/styles/global";
import { TabBar, SideNav, Toast, ShortcutsHelp } from "../shared/components/ui";
import { useShortcuts } from "../shared/hooks/useShortcuts";
import WheelLoader from "../shared/components/wheel/WheelLoader";
import { Landing, Onboarding } from "../features/onboarding";
import { AuthScreen, authService } from "../features/auth";
import { MapScreen } from "../features/map";
import { DomainScreen } from "../features/domain";
import { UnitScreen } from "../features/unit";
import { QuizScreen, ResultScreen } from "../features/quiz";
import { LeagueScreen } from "../features/league";
import { ProfileScreen } from "../features/profile";
import { AdminScreen, StatsScreen, FriendsScreen, SearchScreen, LibraryScreen, ExamScreen, VerifyPage, PublicProfile, ReviewScreen, SectorCelebration } from "./lazyScreens";
import { FirstRunTour, shouldShowTour } from "../features/tour";
import { useGame } from "./useGame";
import { paths, NAV_PATHS, isFocus, readFlags, cleanUrl } from "./routes";

const Loading = () => <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><WheelLoader size={150} /></div>;

// شاشات المتعلّم تتطلب جلسة؛ الزائر يُعاد إلى الصفحة الأولى
function Private({ ready, signedIn, children }) {
  if (!ready) return <Loading />;
  return signedIn ? children : <Navigate to={paths.home} replace />;
}

function Shell() {
  const game = useGame();
  const { profile, progress, resume, xp, weeklyXp, badges, threadsNew, streak, freezes, studied, result, authored, reviewDue, certificate, newSector } = game;
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);
  const [providers, setProviders] = useState({ google: false, registrationOpen: false });
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [tour, setTour] = useState(false);

  useEffect(() => {
    const flags = readFlags();
    authService.providers().then(setProviders).catch(() => {});
    game.boot().then((ok) => {
      if (flags.authFailed) setToast("تعذّر الدخول بحساب Google");
      if (ok && flags.isNew) nav(paths.onboarding, { replace: true });
      if (ok && shouldShowTour()) setTour(true);
      cleanUrl();
    }).catch((err) => setToast(err.message)).finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // كل استدعاء للخادم يمرّ من هنا ليُعرض خطؤه كتنبيه بدل أن يضيع
  const guard = (fn) => async (...args) => { try { return await fn(...args); } catch (err) { setToast(err.message); return undefined; } };
  const openUnit = (id, page) => nav(paths.unit(id), { state: Number.isInteger(page) ? { page } : undefined });
  const finish = guard(async (unitId, payload) => {
    const r = await game.finishUnit(unitId, payload);
    if (r.gain > 0) setToast(`+${r.gain} XP`);
    nav(paths.result, { replace: true });
  });
  const onAuthed = guard(async (user, isNew) => { await game.signIn(user); nav(isNew ? paths.onboarding : paths.home, { replace: true }); });
  const onOnboarded = guard(async ({ minutes, fav }) => { await game.updateSettings({ minutes, fav }); nav(paths.home, { replace: true }); if (shouldShowTour()) setTour(true); setToast(`أهلاً ${profile.name}، ابدأ من المركز`); });
  const onLogout = guard(async () => { await game.signOut(); nav(paths.home, { replace: true }); });
  const onPrefs = guard((fields) => game.updateSettings(fields));
  const backToMap = () => { game.refresh(); nav(paths.home); };

  const next = profile ? nextUnit(progress, profile.fav) : null;
  const focus = isFocus(pathname) || !profile;
  const prefs = { theme: profile?.theme ?? "system", fontScale: profile?.fontScale ?? 1, arabicNums: Boolean(profile?.arabicNums) };
  const inNav = NAV_PATHS.includes(pathname);
  useShortcuts({
    m: () => nav(paths.home), b: () => nav(paths.search), t: () => nav(paths.league),
    f: () => nav(paths.friends), a: () => nav(paths.me), r: () => nav(paths.review),
    Enter: () => { if (pathname === paths.home && next) openUnit(next); },
    Escape: () => (help ? setHelp(false) : nav(-1)),
    "?": () => setHelp(true), "؟": () => setHelp(true),
  }, { enabled: Boolean(profile) && inNav });

  const priv = (el) => <Private ready={ready} signedIn={Boolean(profile)}>{el}</Private>;
  const paper = /^\/u\/[^/]+$/.test(pathname) && authored.includes(pathname.split("/")[2]);

  return (
    <PrefsProvider value={prefs}>
      <div className="madar madar-app" dir="rtl" style={{ background: paper ? P.bg : C.bg, color: paper ? P.ink : C.text, fontFamily: FONT, transition: "background .4s" }}>
        <style>{CSS}</style>
        {!focus && profile && <SideNav path={pathname} onGo={nav} name={profile.name} />}
        <main className={`madar-main${focus ? " is-focus" : ""}`}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={!ready ? <Loading /> : profile
                ? <MapScreen profile={profile} progress={progress} resume={resume} xp={xp} streak={streak} freezes={freezes} weeklyXp={weeklyXp} reviewDue={reviewDue} onOpenDomain={(id, r) => nav(paths.domain(id, r))} onOpenUnit={openUnit} onProfile={() => nav(paths.me)} onReview={() => nav(paths.review)} onToast={setToast} threadsNew={threadsNew} />
                : <Landing onStart={() => nav(paths.auth("register"))} onLogin={() => nav(paths.auth("login"))} googleUrl={providers.google ? authService.googleUrl() : null} canRegister={providers.registrationOpen} />} />
              <Route path="/auth/:mode" element={<AuthRoute onAuthed={onAuthed} onBack={() => nav(paths.home)} canRegister={providers.registrationOpen} />} />
              <Route path="/welcome" element={priv(profile && <Onboarding name={profile.name} onDone={onOnboarded} />)} />
              <Route path="/d/:domainId/:ring" element={priv(<DomainRoute progress={progress} authored={authored} onOpenUnit={openUnit} onBack={() => nav(paths.home)} nav={nav} />)} />
              <Route path="/u/:unitId" element={priv(<UnitRoute game={game} authored={authored} resume={resume} prefs={prefs} readMode={profile?.readMode ?? "cards"} onPrefs={onPrefs} finish={finish} nav={nav} />)} />
              <Route path="/u/:unitId/quiz" element={priv(<QuizRoute finish={finish} nav={nav} />)} />
              <Route path="/result" element={priv(result ? <ResultScreen key={result.unitId + xp} result={result} xp={xp} progress={progress} hasNext={Boolean(next)} onMap={backToMap} onNext={() => openUnit(next)} /> : <Navigate to={paths.home} replace />)} />
              <Route path="/review" element={priv(<ReviewScreen onBack={backToMap} onDone={backToMap} />)} />
              <Route path="/exam" element={priv(<ExamScreen onBack={() => { game.refresh(); nav(paths.me); }} onCertified={(c) => game.setCertificate(c)} />)} />
              <Route path="/library" element={priv(<LibraryScreen progress={progress} onBack={() => nav(paths.me)} onOpenUnit={openUnit} />)} />
              <Route path="/search" element={priv(<SearchScreen onBack={() => nav(paths.home)} onOpenUnit={openUnit} />)} />
              <Route path="/stats" element={priv(<StatsScreen onBack={() => nav(paths.home)} />)} />
              <Route path="/friends" element={priv(profile && <FriendsScreen myHandle={profile.handle} onBack={() => nav(paths.home)} onToast={setToast} />)} />
              <Route path="/league" element={priv(<LeagueScreen />)} />
              <Route path="/me" element={priv(profile && <ProfileScreen profile={profile} progress={progress} xp={xp} badges={badges} streak={streak} freezes={freezes} studied={studied} certificate={certificate} onPrefs={onPrefs} onToggleReminders={(v) => onPrefs({ reminders: v })} onToast={setToast} onLogout={onLogout} onStats={() => nav(paths.stats)} onLibrary={() => nav(paths.library)} onExam={() => nav(paths.exam)} onAdmin={() => nav(paths.admin)} />)} />
              <Route path="/admin/*" element={priv(<AdminScreen onBack={() => nav(paths.me)} onToast={setToast} onContentChanged={game.refreshAuthored} />)} />
              <Route path="/p/:handle" element={<PublicRoute onHome={() => nav(paths.home)} />} />
              <Route path="/verify/:code" element={<VerifyRoute onHome={() => nav(paths.home)} />} />
              <Route path="*" element={<Navigate to={paths.home} replace />} />
            </Routes>
          </Suspense>
          {inNav && profile && <TabBar path={pathname} onGo={nav} />}
          {newSector && <SectorCelebration domainId={newSector} progress={progress} level={xp} onClose={game.clearSector} onShare={() => { game.clearSector(); nav(paths.me); }} />}
          {tour && profile && <FirstRunTour onDone={() => setTour(false)} />}
          {help && <ShortcutsHelp onClose={() => setHelp(false)} />}
          <Toast msg={toast} />
        </main>
      </div>
    </PrefsProvider>
  );
}

// المسارات التي تقرأ معاملاتها من الرابط
const AuthRoute = ({ onAuthed, onBack, canRegister }) => <AuthScreen mode={useParams().mode === "login" ? "login" : "register"} canRegister={canRegister} onBack={onBack} onAuthed={onAuthed} />;
const PublicRoute = ({ onHome }) => <PublicProfile handle={useParams().handle} onHome={onHome} />;
const VerifyRoute = ({ onHome }) => <VerifyPage code={(useParams().code || "").toUpperCase()} onHome={onHome} />;

function DomainRoute({ progress, authored, onOpenUnit, onBack, nav }) {
  const { domainId, ring } = useParams();
  const r = Math.min(2, Math.max(0, Number(ring) - 1 || 0));
  return <DomainScreen domainId={domainId} ringIdx={r} progress={progress} authored={authored} onBack={onBack} onOpenUnit={onOpenUnit} onRing={(i) => nav(paths.domain(domainId, i), { replace: true })} />;
}

function UnitRoute({ game, authored, resume, prefs, readMode, onPrefs, finish, nav }) {
  const { unitId } = useParams();
  const jump = useLocation().state?.page;
  return <UnitScreen key={unitId} unitId={unitId} authored={authored.includes(unitId)}
    resumeCard={Number.isInteger(jump) ? jump : resume?.[unitId] || 0} onResume={game.saveResume}
    fontScale={prefs.fontScale} onFontScale={(s) => onPrefs({ fontScale: s })}
    readMode={readMode} onReadMode={(m) => onPrefs({ readMode: m })}
    onBack={() => nav(isCenter(unitId) ? paths.home : paths.domain(unitId.split("-")[0], Number(unitId.split("-")[1]) - 1))}
    onStartQuiz={() => nav(paths.quiz(unitId))}
    onSimulate={() => finish(unitId, { correct: 7 + Math.floor(Math.random() * 4), total: 10, sim: true })} />;
}

function QuizRoute({ finish, nav }) {
  const { unitId } = useParams();
  return <QuizScreen key={unitId} unitId={unitId} onBack={() => nav(paths.unit(unitId))} onFinish={(answers) => finish(unitId, { answers })} />;
}

export default function App() {
  return <BrowserRouter><Shell /></BrowserRouter>;
}
