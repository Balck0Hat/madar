import { useState } from "react";
import { Award, Timer } from "lucide-react";
import { C, MONO, inputStyle, alpha, T, R, S } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Bar, TopBar, Skeleton, ErrorState, Confetti } from "../../../shared/components/ui";
import OrderQuestion from "../../quiz/components/OrderQuestion";
import { isReady } from "../../quiz/utils/quiz.utils";
import { useExamTimer, clock } from "../hooks/useExamTimer";
import ExamIntro from "./ExamIntro";
import { getStatus, startExam, submitExam } from "../services/exam.service";

const arDate = (d) => new Date(d).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" });

// امتحان إتمام المدار الأول: أسئلة محجوزة لم تظهر في التمارين، مهلة محدودة،
// ومحاولة واحدة كل ثلاثين يوماً. النجاح 80% يمنح شهادة إتمام (امتحان غير مراقَب).
export default function ExamScreen({ onBack, onCertified }) {
  const num = useNum();
  const { data: status, loading, error, reload } = useAsync(getStatus, []);
  const [attempt, setAttempt] = useState(null);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const left = useExamTimer(attempt && !result ? attempt.endsAt : null);

  const run = async (fn) => { setBusy(true); setErr(""); try { return await fn(); } catch (e) { setErr(e.message); return null; } finally { setBusy(false); } };
  const begin = () => run(async () => setAttempt(await startExam()));
  const answerAndNext = () => {
    const q = attempt.questions[i];
    const next = [...answers, { unitId: q.unitId, qid: q.qid, answer: sel }];
    setAnswers(next); setSel(null);
    if (i + 1 < attempt.questions.length) setI(i + 1);
    else run(async () => { const r = await submitExam(attempt.attemptId, next); setResult(r); if (r.certificate) onCertified(r.certificate); });
  };

  // العدّاد يحمرّ في الدقائق الخمس الأخيرة: تنبيه قبل أن يرفض الخادم التسليم المتأخر
  const timer = attempt && !result && (
    <span style={{ display: "inline-flex", gap: S.lg, alignItems: "center", fontFamily: MONO, fontSize: T.sm, color: left <= 300 ? C.red : C.muted }}>
      <span style={{ display: "inline-flex", gap: S.xs, alignItems: "center" }}><Timer size={12} />{num(clock(left))}</span>
      <span>{num(i + 1)}/{num(attempt.total)}</span>
    </span>
  );
  const shell = (children) => (
    <div className="madar-in" style={{ minHeight: "100vh" }}>
      <TopBar title="امتحان الإتمام" onBack={onBack} right={timer} />
      <div style={{ padding: `${S.lg}px ${S.x4}px ${S.x7}px` }}>{children}</div>
    </div>
  );
  if (loading || error) return shell(error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton lines={4} />);

  if (result) {
    return shell(
      <div style={{ textAlign: "center", paddingTop: S.x5 }}>
        {result.passed && <Confetti color={C.gold} />}
        <Award size={48} color={result.passed ? C.gold : C.muted} />
        <div style={{ fontSize: T.x5, fontWeight: 700, marginTop: S.xl }}>{result.passed ? "اجتزت امتحان الإتمام" : "لم تجتز هذه المرة"}</div>
        <div style={{ fontFamily: MONO, fontSize: T.x4, color: result.passed ? C.gold : C.red, marginTop: S.md }}>{num(result.score)}/{num(result.total)}</div>
        <div style={{ color: C.muted, marginTop: S.lg, lineHeight: 1.7 }}>
          {result.passed
            ? `رمز شهادتك: ${result.certificate.code} — شهادة إتمام، والامتحان غير مراقَب.`
            : `النجاح يحتاج ثمانين بالمئة. المحاولة القادمة تُفتح في ${arDate(result.reopensAt)}؛ راجع الوحدات حتى ذلك الحين.`}
        </div>
        <div style={{ marginTop: S.x5 }}><Btn primary onClick={onBack}>{result.passed ? "اعرض الشهادة" : "العودة"}</Btn></div>
      </div>,
    );
  }

  if (!attempt) return shell(<ExamIntro status={status} num={num} err={err} busy={busy} onBegin={begin} />);

  const q = attempt.questions[i], info = unitInfo(q.unitId);
  const optBtn = (label, v) => <button key={String(v)} type="button" onClick={() => setSel(v)} aria-pressed={sel === v} style={{ background: sel === v ? alpha(info.color, 0.15) : C.surface, border: `1px solid ${sel === v ? info.color : C.line}`, borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px`, color: C.text, textAlign: "start", cursor: "pointer", fontSize: T.lg }}>{label}</button>;
  return shell(
    <>
      <Bar value={i / attempt.total} color={C.gold} h={4} />
      <div style={{ color: info.color, fontSize: T.sm, fontWeight: 600, marginTop: S.x2 }}>{info.domainName}</div>
      <div style={{ fontSize: T.x3, fontWeight: 700, margin: `${S.lg}px 0 ${S.x4}px`, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "grid", gap: S.lg }}>
        {q.t === "mcq" && q.opts.map((o, k) => optBtn(o, k))}
        {q.t === "tf" && [["صح", true], ["خطأ", false]].map(([l, v]) => optBtn(l, v))}
        {q.t === "fill" && <input aria-label="إجابتك" value={sel || ""} onChange={(e) => setSel(e.target.value)} placeholder="اكتب إجابتك" style={inputStyle} />}
        {q.t === "order" && <OrderQuestion items={q.items} sel={sel} color={info.color} locked={false} onChange={setSel} />}
      </div>
      {err && <div role="alert" style={{ color: C.red, fontSize: T.base, marginTop: S.lg }}>{err}</div>}
      <div style={{ marginTop: S.x4 }}><Btn primary disabled={!isReady(q, sel) || busy} onClick={answerAndNext}>{busy ? "يُصحَّح..." : i + 1 < attempt.total ? "التالي" : "سلّم الامتحان"}</Btn></div>
    </>,
  );
}
