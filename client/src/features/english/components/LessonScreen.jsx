import { useState } from "react";
import { BookOpen } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getLesson, startLesson, answerPractice } from "../services/english.service";
import PracticeRunner from "./PracticeRunner";

// درس إنجليزية عامة: شرح بالعربية بأقسام وأمثلة، ثم تمرين من ثماني أسئلة
export default function LessonScreen({ tag, onBack }) {
  const num = useNum();
  const { data: lesson, loading, error, reload } = useAsync(() => getLesson(tag), [tag]);
  const [run, setRun] = useState(null); // { attempt, items, label }
  const [score, setScore] = useState(null);
  const [err, setErr] = useState("");
  const begin = () => { setErr(""); setScore(null); startLesson(tag).then(setRun).catch((e) => setErr(e.message)); };

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={lesson?.title || "درس"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  if (score) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5 }}>
        <div style={{ color: C.muted, fontSize: T.sm }}>تمرين {lesson.title}</div>
        <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: score.pct >= 75 ? C.green : C.gold, lineHeight: 1.1 }}>{num(score.pct)}٪</div>
        <div style={{ fontWeight: 700 }}>{num(score.raw)} من {num(score.total)}</div>
        <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.x2, lineHeight: 1.7 }}>{score.pct >= 75 ? "متقن. انتقل إلى الدرس التالي." : "أعد قراءة الشرح ثم جرّب التمرين مرة أخرى."}</div>
      </div>
      <div style={{ display: "flex", gap: S.lg }}><Btn primary onClick={onBack}>الدروس</Btn><Btn paper full={false} onClick={begin}>أعد التمرين</Btn></div>
    </div>,
  );
  if (run) return shell(<PracticeRunner items={run.items} label={run.label} onAnswer={(itemId, choice) => answerPractice(run.attempt.id, itemId, choice)} onDone={(s) => { setRun(null); setScore(s); }} />);

  return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.md, color: C.muted, fontSize: T.xs }}><BookOpen size={14} aria-hidden="true" />المستوى {lesson.level} · نحو {num(lesson.minutes)} دقيقة</div>
      {lesson.explain.map((sec, i) => (
        <section key={i} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
          <h2 style={{ margin: 0, fontSize: T.x2, fontWeight: 700 }}>{sec.h}</h2>
          <p style={{ margin: 0, lineHeight: 1.9 }}>{sec.p}</p>
          <div style={{ display: "grid", gap: S.md }}>
            {sec.ex.map((e, j) => (
              <div key={j} style={{ borderInlineStart: `3px solid ${alpha(C.gold, 0.6)}`, paddingInlineStart: S.x2 }}>
                <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.lg }}>{e.en}</div>
                <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>{e.ar}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <Btn primary onClick={begin}>ابدأ التمرين ({num(lesson.qs.length)} أسئلة)</Btn>
    </div>,
  );
}
