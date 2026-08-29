import { useState, useEffect } from "react";
import { C, P, FONT } from "../shared/constants/theme";
import { CONTENT } from "../shared/data/content";
import { nextUnit } from "../shared/utils/progress";
import { isCenter } from "../shared/utils/units";
import { NumCtx } from "../shared/context/NumContext";
import { CSS } from "../shared/styles/global";
import { TabBar, Toast } from "../shared/components/ui";
import { Landing, Onboarding } from "../features/onboarding";
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
  const { profile, setProfile, progress, xp, weeklyXp, badges, threadsNew, streak, studied, result } = game;
  const [screen, setScreen] = useState("landing");
  const [cur, setCur] = useState({ domain: "human", ring: 0, unit: null });
  const [toast, setToast] = useState("");
  const [arabicNums, setArabicNums] = useState(false);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const openDomain = (id, r = 0) => { setCur((c) => ({ ...c, domain: id, ring: r })); setScreen("domain"); };
  const openUnit = (id) => { setCur((c) => ({ ...c, unit: id })); setScreen("unit"); };
  const finish = (unitId, correct, total, sim) => {
    const gain = game.finishUnit(unitId, correct, total, sim);
    if (gain > 0) setToast(`+${gain} XP`);
    setScreen("result");
  };

  const next = nextUnit(progress, profile.fav);
  const showTabs = TABS.includes(screen);
  const paper = screen === "unit" && Boolean(CONTENT[cur.unit]);

  return (
    <NumCtx.Provider value={arabicNums}>
      <div className="madar" dir="rtl" style={{ minHeight: "100vh", background: paper ? P.bg : C.bg, color: paper ? P.ink : C.text, fontFamily: FONT, display: "flex", justifyContent: "center", transition: "background .4s" }}>
        <style>{CSS}</style>
        <main style={{ width: "100%", maxWidth: 430, minHeight: "100vh", position: "relative" }}>
          {screen === "landing" && <Landing onStart={() => setScreen("onboarding")} />}
          {screen === "onboarding" && <Onboarding onDone={(p) => { setProfile(p); setScreen("map"); setToast(`أهلاً ${p.name}، ابدأ من المركز`); }} />}
          {screen === "map" && <MapScreen profile={profile} progress={progress} xp={xp} streak={streak} weeklyXp={weeklyXp} onOpenDomain={openDomain} onOpenUnit={openUnit} onProfile={() => setScreen("me")} threadsNew={threadsNew} />}
          {screen === "domain" && <DomainScreen domainId={cur.domain} ringIdx={cur.ring} progress={progress} onBack={() => setScreen("map")} onOpenUnit={openUnit} onRing={(r) => setCur((c) => ({ ...c, ring: r }))} />}
          {screen === "unit" && <UnitScreen key={cur.unit} unitId={cur.unit} onBack={() => setScreen(isCenter(cur.unit) ? "map" : "domain")} onStartQuiz={() => setScreen("quiz")} onSimulate={() => { const c = 7 + Math.floor(Math.random() * 4); finish(cur.unit, c, 10, true); }} />}
          {screen === "quiz" && <QuizScreen key={cur.unit} unitId={cur.unit} questions={CONTENT[cur.unit].quiz} onBack={() => setScreen("unit")} onFinish={(c, t) => finish(cur.unit, c, t, false)} />}
          {screen === "result" && result && <ResultScreen key={result.unitId + xp} result={result} xp={xp} progress={progress} hasNext={Boolean(next)} onMap={() => setScreen("map")} onNext={() => openUnit(next)} />}
          {screen === "league" && <LeagueScreen profile={profile} weeklyXp={weeklyXp} />}
          {screen === "me" && <ProfileScreen profile={profile} progress={progress} xp={xp} badges={badges} streak={streak} studied={studied} arabicNums={arabicNums} onToggleNums={setArabicNums} onToast={setToast} />}
          {showTabs && <TabBar tab={screen} onTab={setScreen} />}
          <Toast msg={toast} />
        </main>
      </div>
    </NumCtx.Provider>
  );
}
