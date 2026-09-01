import { useState, useEffect, useRef } from "react";
import { Timer, ChevronRight, ChevronLeft, Cloud } from "lucide-react";
import { C, MONO, T, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Bar, TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { useExamTimer, clock } from "../hooks/useExamTimer";
import { useExamAttempt } from "../hooks/useExamAttempt";
import { getStatus, startExam } from "../services/exam.service";
import ExamIntro from "./ExamIntro";
import ExamQuestion from "./ExamQuestion";
import ExamReview from "./ExamReview";
import ExamResult from "./ExamResult";

// امتحان إتمام المدار الأول: أسئلة محجوزة لم تظهر في التمارين، موزّعة على
// المجالات كلها، مهلة محدودة، ومحاولة واحدة كل ثلاثين يوماً.
export default function ExamScreen({ onBack, onCertified }) {
  const num = useNum();
  const { data: status, loading, error, reload } = useAsync(getStatus, []);
  const [attempt, setAttempt] = useState(null);
  const [i, setI] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const left = useExamTimer(attempt && !result ? attempt.endsAt : null);
  const { answers, setAnswer, answeredCount, syncing, saveError, submit, keyOf } = useExamAttempt(attempt);

  const run = async (fn) => { setBusy(true); setErr(""); try { return await fn(); } catch (e) { setErr(e.message); return null; } finally { setBusy(false); } };
  const begin = () => run(async () => { const a = await startExam(); setAttempt(a); setI(0); });
  const finish = () => run(async () => { const r = await submit(); setResult(r); if (r.certificate) onCertified(r.certificate); });

  // التسليم التلقائي عند انتهاء المهلة: كان العدّاد يبلغ صفراً والواجهة تتابع
  // قبول الإجابات، فلا يكتشف المتعلّم ضياع محاولته إلا عند رفض الخادم.
  const auto = useRef(false);
  useEffect(() => {
    if (!attempt || result || busy || left > 0 || auto.current) return;
    auto.current = true;
    finish();
  }, [left, attempt, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const timer = attempt && !result && (
    <span style={{ display: "inline-flex", gap: S.lg, alignItems: "center", fontFamily: MONO, fontSize: T.sm, color: left <= 300 ? C.red : C.muted }}>
      {syncing && <Cloud size={12} aria-label="يُحفظ" />}
      <span style={{ display: "inline-flex", gap: S.xs, alignItems: "center" }}><Timer size={12} />{num(clock(left))}</span>
      <span>{num(answeredCount)}/{num(attempt.total)}</span>
    </span>
  );
  const shell = (children) => (
    <div className="madar-in" style={{ minHeight: "100vh" }}>
      <TopBar title="امتحان الإتمام" onBack={onBack} right={timer} />
      <div style={{ padding: `${S.lg}px ${S.x4}px ${S.x7}px` }}>{children}</div>
    </div>
  );

  if (loading || error) return shell(error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton lines={4} />);
  if (result) return shell(<ExamResult result={result} num={num} onBack={onBack} />);
  if (!attempt) return shell(<ExamIntro status={status} num={num} err={err} busy={busy} onBegin={begin} />);
  if (reviewing) {
    return shell(
      <ExamReview questions={attempt.questions} answers={answers} keyOf={keyOf} busy={busy}
        onJump={(k) => { setI(k); setReviewing(false); }} onSubmit={finish} />,
    );
  }

  const q = attempt.questions[i];
  const last = i + 1 >= attempt.total;
  return shell(
    <>
      <Bar value={answeredCount / attempt.total} color={C.gold} h={4} />
      <ExamQuestion q={q} value={answers[keyOf(q)] ?? null} onChange={(v) => setAnswer(q, v)} />
      {(err || saveError) && <div role="alert" style={{ color: C.red, fontSize: T.base, marginTop: S.lg }}>{err || saveError}</div>}
      {/* التنقّل حرّ في الاتجاهين، ولا يشترط إجابة: السؤال الصعب يُترك ويُعاد إليه */}
      <div style={{ display: "flex", gap: S.lg, marginTop: S.x4 }}>
        <Btn full={false} disabled={i === 0} onClick={() => setI(i - 1)} style={{ flex: "0 0 auto" }}>
          <ChevronRight size={16} aria-label="السابق" />
        </Btn>
        {last
          ? <Btn primary onClick={() => setReviewing(true)} style={{ flex: 1 }}>راجع وسلّم</Btn>
          : <Btn primary onClick={() => setI(i + 1)} style={{ flex: 1 }}>التالي</Btn>}
        <Btn full={false} disabled={last} onClick={() => setI(i + 1)} style={{ flex: "0 0 auto" }}>
          <ChevronLeft size={16} aria-label="التالي" />
        </Btn>
      </div>
      <button type="button" onClick={() => setReviewing(true)}
        style={{ background: "none", border: 0, color: C.muted, fontFamily: "inherit", fontSize: T.base, cursor: "pointer", marginTop: S.x2, padding: S.lg, minHeight: 44 }}>
        اعرض كل الأسئلة ({num(i + 1)} من {num(attempt.total)})
      </button>
    </>,
  );
}
