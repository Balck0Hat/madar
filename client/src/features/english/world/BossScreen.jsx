import { useState } from "react";
import { Crown, Lock } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn, Confetti } from "../../../shared/components/ui";
import { startBoss, answerPractice } from "../services/english.service";
import PracticeRunner from "../components/PracticeRunner";

const PASS = 70;

// امتحان زعيم المحطة: 15 سؤالاً من كل دروسها؛ النجاح 70٪ يفتح المحطة التالية في الرحلة.
// الزعيم المقفل ليس عطلاً: يظهر سببه وزر العودة إلى الرحلة، لا «تعذّر التحميل».
export default function BossScreen({ island, onBack }) {
  const num = useNum();
  const { data: run, loading, error, reload } = useAsync(() => startBoss(island), [island]);
  const [score, setScore] = useState(null);
  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={run?.en || run?.label || "زعيم المحطة"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  const card = (icon, tone, big, title, text, actions) => (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5, display: "grid", gap: S.md, justifyItems: "center" }}>
        <span style={{ width: 64, height: 64, borderRadius: R.pill, background: alpha(tone, 0.14), display: "grid", placeItems: "center" }}>{icon}</span>
        {big}
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>{title}</div>
        <div style={{ color: C.muted, fontSize: T.base, lineHeight: 1.8, maxWidth: 360 }}>{text}</div>
      </div>
      {actions}
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error?.code === "BOSS_LOCKED") return shell(card(<Lock size={28} color={C.muted} aria-hidden="true" />, C.muted, null, "الزعيم مقفل", error.message, <Btn primary onClick={onBack}>عودة إلى الرحلة</Btn>));
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  if (score) {
    const passed = score.pct >= PASS;
    return shell(
      <>
        {passed && <Confetti color={C.gold} />}
        {card(<Crown size={30} color={passed ? C.gold : C.muted} aria-hidden="true" />, passed ? C.gold : C.red,
          <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: passed ? C.gold : C.red, lineHeight: 1.1 }}>{num(score.pct)}٪</div>,
          passed ? "اجتزت الزعيم" : "لم تجتز هذه المرة",
          passed ? "انفتحت المحطة التالية في رحلتك. تابع من حيث وصلت." : `النجاح ${num(PASS)}٪. راجع الدروس التي أخطأت فيها ثم عد.`,
          <div style={{ display: "flex", gap: S.lg }}><Btn primary onClick={onBack}>عودة إلى الرحلة</Btn><Btn paper full={false} onClick={() => { setScore(null); reload(); }}>حاول مجدداً</Btn></div>)}
      </>,
    );
  }
  return shell(<PracticeRunner items={run.items} label={run.label} onAnswer={(itemId, choice) => answerPractice(run.attempt.id, itemId, choice)} onDone={setScore} />);
}
