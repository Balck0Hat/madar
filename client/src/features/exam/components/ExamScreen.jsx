import { useState } from "react";
import { Award } from "lucide-react";
import { C, MONO, inputStyle } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, Bar, TopBar, Skeleton, ErrorState, Confetti } from "../../../shared/components/ui";
import OrderQuestion from "../../quiz/components/OrderQuestion";
import { isReady } from "../../quiz/utils/quiz.utils";
import { getStatus, startExam, submitExam } from "../services/exam.service";

// امتحان المدار الأول: 30 سؤالاً بلا تغذية راجعة، النجاح 80% يمنح الشهادة
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

  const run = async (fn) => { setBusy(true); setErr(""); try { return await fn(); } catch (e) { setErr(e.message); return null; } finally { setBusy(false); } };
  const begin = () => run(async () => setAttempt(await startExam()));
  const answerAndNext = () => {
    const q = attempt.questions[i];
    const next = [...answers, { unitId: q.unitId, qid: q.qid, answer: sel }];
    setAnswers(next); setSel(null);
    if (i + 1 < attempt.questions.length) setI(i + 1);
    else run(async () => { const r = await submitExam(attempt.attemptId, next); setResult(r); if (r.certificate) onCertified(r.certificate); });
  };

  const shell = (children) => (
    <div className="madar-in" style={{ minHeight: "100vh" }}>
      <TopBar title="امتحان المدار الأول" onBack={onBack} right={attempt && !result ? <span style={{ fontFamily: MONO, color: C.muted, fontSize: 12 }}>{num(i + 1)}/{num(attempt.total)}</span> : null} />
      <div style={{ padding: "8px 18px 30px" }}>{children}</div>
    </div>
  );
  if (loading || error) return shell(error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton lines={4} />);

  if (result) {
    return shell(
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        {result.passed && <Confetti color={C.gold} />}
        <Award size={48} color={result.passed ? C.gold : C.muted} />
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 10 }}>{result.passed ? "مبارك، أنت مثقف" : "لم تكتمل بعد"}</div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: result.passed ? C.gold : C.red, marginTop: 6 }}>{num(result.score)}/{num(result.total)}</div>
        <div style={{ color: C.muted, marginTop: 8, lineHeight: 1.7 }}>{result.passed ? `رمز شهادتك: ${result.certificate.code}` : "النجاح يحتاج 80%. راجع الوحدات التي أخطأت فيها وعد."}</div>
        <div style={{ marginTop: 20 }}><Btn primary onClick={onBack}>{result.passed ? "اعرض الشهادة" : "العودة"}</Btn></div>
      </div>,
    );
  }

  if (!attempt) {
    return shell(
      <Card>
        {status.certificate ? (
          <><div style={{ fontWeight: 800 }}>لديك شهادة بالفعل</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>الرمز {status.certificate.code}</div></>
        ) : (
          <>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{status.eligible ? "أنت جاهز" : "لم يُفتح بعد"}</div>
            <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginTop: 6 }}>{status.eligible ? "30 سؤالاً من وحدات المدار الأول، بلا تغذية راجعة أثناء الامتحان. النجاح 80%." : "يُفتح الامتحان بعد إكمال وحدات المركز الثلاث والمجالات العشرة كلها."}</div>
            {err && <div role="alert" style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{err}</div>}
            <div style={{ marginTop: 14 }}><Btn primary disabled={!status.eligible || busy} onClick={begin}>{busy ? "لحظة..." : "ابدأ الامتحان"}</Btn></div>
          </>
        )}
      </Card>,
    );
  }

  const q = attempt.questions[i], info = unitInfo(q.unitId);
  const optBtn = (label, v) => <button key={String(v)} type="button" onClick={() => setSel(v)} aria-pressed={sel === v} style={{ background: sel === v ? info.color + "26" : C.surface, border: `1px solid ${sel === v ? info.color : C.line}`, borderRadius: 14, padding: "13px 14px", color: C.text, textAlign: "start", cursor: "pointer", fontSize: 15 }}>{label}</button>;
  return shell(
    <>
      <Bar value={i / attempt.total} color={C.gold} h={4} />
      <div style={{ color: info.color, fontSize: 12, fontWeight: 700, marginTop: 12 }}>{info.domainName}</div>
      <div style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 16px", lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {q.t === "mcq" && q.opts.map((o, k) => optBtn(o, k))}
        {q.t === "tf" && [["صح", true], ["خطأ", false]].map(([l, v]) => optBtn(l, v))}
        {q.t === "fill" && <input aria-label="إجابتك" value={sel || ""} onChange={(e) => setSel(e.target.value)} placeholder="اكتب إجابتك" style={inputStyle} />}
        {q.t === "order" && <OrderQuestion items={q.items} sel={sel} color={info.color} locked={false} onChange={setSel} />}
      </div>
      {err && <div role="alert" style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{err}</div>}
      <div style={{ marginTop: 18 }}><Btn primary disabled={!isReady(q, sel) || busy} onClick={answerAndNext}>{busy ? "يُصحَّح..." : i + 1 < attempt.total ? "التالي" : "سلّم الامتحان"}</Btn></div>
    </>,
  );
}
