import { useState } from "react";
import { Crown } from "lucide-react";
import { C, R, S, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn, Confetti } from "../../../shared/components/ui";
import { startBoss, answerPractice } from "../services/english.service";
import PracticeRunner from "../components/PracticeRunner";

const PASS = 70;

// امتحان زعيم الجزيرة: 15 سؤالاً من كل مواضيعها؛ النجاح 70٪ يفتح الجزيرة التالية
export default function BossScreen({ island, onBack }) {
  const num = useNum();
  const { data: run, loading, error, reload } = useAsync(() => startBoss(island), [island]);
  const [score, setScore] = useState(null);
  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={run?.label || "زعيم الجزيرة"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  if (score) {
    const passed = score.pct >= PASS;
    return shell(
      <div style={{ display: "grid", gap: S.x3 }}>
        {passed && <Confetti color={C.gold} />}
        <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5 }}>
          <Crown size={36} color={passed ? C.gold : C.muted} aria-hidden="true" />
          <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: passed ? C.gold : C.red, lineHeight: 1.1 }}>{num(score.pct)}٪</div>
          <div style={{ fontWeight: 700, fontSize: T.x2 }}>{passed ? "اجتزت الزعيم" : "لم تجتز هذه المرة"}</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.x2, lineHeight: 1.7 }}>{passed ? "بُني الجسر إلى الجزيرة التالية. أكمل الرحلة." : `النجاح ${num(PASS)}٪. راجع المواضيع التي أخطأت فيها ثم عد.`}</div>
        </div>
        <div style={{ display: "flex", gap: S.lg }}><Btn primary onClick={onBack}>عودة إلى الخريطة</Btn><Btn paper full={false} onClick={() => { setScore(null); reload(); }}>حاول مجدداً</Btn></div>
      </div>,
    );
  }
  return shell(<PracticeRunner items={run.items} label={run.label} onAnswer={(itemId, choice) => answerPractice(run.attempt.id, itemId, choice)} onDone={setScore} />);
}
