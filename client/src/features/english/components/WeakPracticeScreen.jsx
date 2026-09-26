import { useState } from "react";
import { C, R, S, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { startWeak, answerPractice, getTracks } from "../services/english.service";
import PracticeRunner from "./PracticeRunner";

const tone = (p) => (p >= 80 ? C.green : p < 60 ? C.red : C.gold);

// تمرين نقطة ضعف: عشرة أسئلة من بنك الموضوع نفسه (ما لم يُرَ أولاً)، ثم النسبة وتاريخ التحسن
export default function WeakPracticeScreen({ tag, onBack, onLesson }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getTracks(), [tag]);
  const [run, setRun] = useState(null);
  const [score, setScore] = useState(null);
  const [err, setErr] = useState("");
  const info = [...(data?.weak || []), ...(data?.practised || [])].find((w) => w.tag === tag);
  const history = [...(info?.history || []), ...(score ? [{ pct: score.pct, at: new Date().toISOString() }] : [])];
  const begin = () => { setErr(""); setScore(null); startWeak(tag).then(setRun).catch((e) => setErr(e.message)); };

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={run?.label || info?.label || "تدريب"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={6} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  if (run) return shell(<PracticeRunner items={run.items} label={run.label} onAnswer={(itemId, choice) => answerPractice(run.attempt.id, itemId, choice)} onDone={(s) => { setRun(null); setScore(s); }} />);

  return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      {score && (
        <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5 }}>
          <div style={{ color: C.muted, fontSize: T.sm }}>هذه المرة</div>
          <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: tone(score.pct), lineHeight: 1.1 }}>{num(score.pct)}٪</div>
          <div style={{ fontWeight: 700 }}>{num(score.raw)} من {num(score.total)}</div>
        </div>
      )}
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
        <div style={{ fontWeight: 700 }}>{info?.label || tag}</div>
        {info?.rate !== undefined && <div style={{ color: C.muted, fontSize: T.sm }}>في اختبار المستوى: {num(info.rate)}٪</div>}
        {history.length ? (
          <div style={{ display: "grid", gap: S.md }}>
            <div style={{ fontSize: T.xs, color: C.muted }}>تمارينك السابقة</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: S.md, height: 72 }} aria-label="تاريخ التحسن">
              {history.slice(-10).map((h, i) => (
                <div key={i} title={`${h.pct}٪ · ${new Date(h.at).toLocaleDateString("ar")}`} style={{ flex: 1, display: "grid", gap: S.xs, alignContent: "end", height: "100%" }}>
                  <div style={{ height: `${Math.max(6, h.pct * 0.6)}px`, background: tone(h.pct), borderRadius: R.sm }} />
                  <div className="madar-num" style={{ fontSize: T.xs, color: C.muted, textAlign: "center" }}>{num(h.pct)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>عشرة أسئلة من هذا الموضوع تحديداً، تُختار أولاً مما لم تره بعد. كرّر التمرين أياماً متباعدة لترى المنحنى يصعد.</div>}
      </div>
      <Btn primary onClick={begin}>{score ? "تمرين آخر" : "ابدأ التمرين (10 أسئلة)"}</Btn>
      {info?.hasLesson && <Btn paper onClick={() => onLesson(tag)}>اقرأ شرح الموضوع أولاً</Btn>}
    </div>,
  );
}
