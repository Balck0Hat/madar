import { useCallback, useEffect, useState } from "react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getModule, startModule, submitSection } from "../services/english.service";
import PassageView from "./PassageView";
import ListenBox from "./ListenBox";
import QuestionItem from "./QuestionItem";
import StageTimer from "./StageTimer";
import ModuleResult from "./ModuleResult";

// وحدة قراءة أو استماع بأقسامها كما في الامتحان: مؤقّت للوحدة كلها، كل أسئلة القسم في صفحة
// واحدة ثم «سلّم القسم»، فيظهر التصحيح والشرح، ثم القسم التالي، ثم الدرجة التقريبية.
export default function ModuleScreen({ moduleId, onBack }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getModule(moduleId), [moduleId]);
  const [attempt, setAttempt] = useState(null);
  const [si, setSi] = useState(0);
  const [values, setValues] = useState({});
  const [graded, setGraded] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const mod = data?.module;
  useEffect(() => { if (data?.attempt) { setAttempt(data.attempt); setSi(data.attempt.doneSections.length); } }, [data]);
  const section = mod?.sections[si];
  const finished = attempt?.finishedAt && attempt?.score;

  const start = () => { setErr(""); startModule(moduleId).then((a) => { setAttempt(a); setSi(0); setValues({}); setGraded(null); setTimeUp(false); }).catch((e) => setErr(e.message)); };
  const submit = useCallback(async () => {
    if (!section || busy) return;
    setBusy(true); setErr("");
    try {
      const answers = Object.entries(values).filter(([k, v]) => k.startsWith(`${section.id}#`) && v !== "" && v !== null && !(Array.isArray(v) && !v.length)).map(([itemId, choice]) => ({ itemId, choice }));
      const r = await submitSection(attempt.id, section.id, answers);
      setGraded(r.graded); setAttempt(r.attempt);
    } catch (e) { setErr(e.message || "تعذّر الاتصال"); } finally { setBusy(false); }
  }, [section, values, attempt, busy]);
  const expire = useCallback(() => { setTimeUp(true); if (!graded) submit(); }, [graded, submit]);
  const next = () => { setGraded(null); setSi(si + 1); window.scrollTo({ top: 0 }); };

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={mod?.title || "وحدة"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {attempt && !finished && !timeUp && <StageTimer timer={{ startedAt: attempt.startedAt, budget: mod.minutes * 60, now: Date.now() }} onExpire={expire} />}
        {timeUp && !finished && <div role="status" style={{ color: C.gold, fontSize: T.sm }}>انتهى وقت الوحدة. سُلِّم القسم الحالي بما أُجيب، وتستطيع إكمال الباقي بلا وقت للتدريب.</div>}
        {err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}
        {children}
      </div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  if (!mod) return null;

  if (finished) return shell(<ModuleResult module={mod} score={attempt.score} onRetry={start} onBack={onBack} />);
  if (!attempt) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <h1 style={{ fontSize: T.x4, fontWeight: 700, margin: 0 }}>{mod.title}</h1>
      <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>{num(mod.sections.length)} أقسام · {num(mod.sections.reduce((n, s) => n + s.qs.length, 0))} سؤالاً · {num(mod.minutes)} دقيقة بمؤقّت واحد للوحدة كما في الامتحان. أجب عن أسئلة كل قسم ثم سلّمه لترى التصحيح والشرح.{mod.skill === "listening" ? " في الاستماع يُشغَّل الصوت مرة ويُعاد مرة واحدة." : ""}</p>
      <Btn primary onClick={start}>ابدأ</Btn>
    </div>,
  );
  return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>القسم {num(si + 1)} من {num(mod.sections.length)} · {num(section.qs.length)} أسئلة</div>
      {section.lines ? <ListenBox part={{ id: section.id, audio: section.audio, accent: section.accent, lines: section.lines }} /> : <PassageView section={section} />}
      {section.lines && section.intro && <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif", color: C.muted, fontSize: T.sm }}>{section.intro}</div>}
      <div style={{ display: "grid", gap: S.x4, background: alpha(C.gold, 0.04), border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3 }}>
        {section.qs.map((q, qi) => {
          const key = `${section.id}#${qi}`;
          const g = graded?.find((x) => x.itemId === key);
          return <QuestionItem key={key} n={qi + 1} q={q} value={values[key]} onChange={(v) => setValues((s) => ({ ...s, [key]: v }))} result={g ? { correct: g.correct, a: g.a, why: g.why, choice: g.choice } : null} />;
        })}
      </div>
      {graded
        ? <Btn primary onClick={next}>{si + 1 < mod.sections.length ? "القسم التالي" : "النتيجة"}</Btn>
        : <Btn primary onClick={submit} disabled={busy}>{busy ? "جارٍ التصحيح…" : "سلّم القسم"}</Btn>}
    </div>,
  );
}
