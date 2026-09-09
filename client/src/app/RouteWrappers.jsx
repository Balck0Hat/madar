import { useParams, useLocation } from "react-router-dom";
import { isCenter } from "../shared/utils/units";
import { AuthScreen } from "../features/auth";
import { DomainScreen } from "../features/domain";
import { UnitScreen } from "../features/unit";
import { QuizScreen } from "../features/quiz";
import { VerifyPage, PublicProfile } from "./lazyScreens";
import { paths } from "./routes";

// المسارات التي تقرأ معاملاتها من الرابط
export const AuthRoute = ({ onAuthed, onBack, canRegister }) => <AuthScreen mode={useParams().mode === "login" ? "login" : "register"} canRegister={canRegister} onBack={onBack} onAuthed={onAuthed} />;
export const PublicRoute = ({ onHome }) => <PublicProfile handle={useParams().handle} onHome={onHome} />;
export const VerifyRoute = ({ onHome }) => <VerifyPage code={(useParams().code || "").toUpperCase()} onHome={onHome} />;

export function DomainRoute({ progress, authored, onOpenUnit, onBack, nav }) {
  const { domainId, ring } = useParams();
  const r = Math.min(2, Math.max(0, Number(ring) - 1 || 0));
  return <DomainScreen domainId={domainId} ringIdx={r} progress={progress} authored={authored} onBack={onBack} onOpenUnit={onOpenUnit} onRing={(i) => nav(paths.domain(domainId, i), { replace: true })} />;
}

export function UnitRoute({ game, authored, resume, prefs, readMode, onPrefs, finish, finishRead, progress, nav }) {
  const { unitId } = useParams();
  const jump = useLocation().state?.page;
  return <UnitScreen key={unitId} unitId={unitId} authored={authored.includes(unitId)} done={Boolean(progress?.[unitId])} onFinishRead={() => finishRead(unitId)}
    resumeCard={Number.isInteger(jump) ? jump : resume?.[unitId] || 0} onResume={game.saveResume}
    fontScale={prefs.fontScale} onFontScale={(s) => onPrefs({ fontScale: s })}
    readMode={readMode} onReadMode={(m) => onPrefs({ readMode: m })}
    onBack={() => nav(isCenter(unitId) ? paths.home : paths.domain(unitId.split("-")[0], Number(unitId.split("-")[1]) - 1))}
    onStartQuiz={() => nav(paths.quiz(unitId))}
    onSimulate={() => finish(unitId, { correct: 7 + Math.floor(Math.random() * 4), total: 10, sim: true })} />;
}

export function QuizRoute({ finish, nav }) {
  const { unitId } = useParams();
  return <QuizScreen key={unitId} unitId={unitId} onBack={() => nav(paths.unit(unitId))} onFinish={(answers) => finish(unitId, { answers })} />;
}

