import { useEffect, useState } from "react";
import { C, R, S, T, inputStyle, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getWritingTask, submitTaskWriting, getAttempt } from "../services/english.service";
import DataTable from "./DataTable";
import LineChart from "./LineChart";
import StageTimer from "./StageTimer";
import WritingFeedback from "./WritingFeedback";

const CRIT = { task: "المهمة", coherence: "التماسك", lexis: "المفردات", grammar: "القواعد", contribution: "المساهمة", elaboration: "التفصيل", language: "اللغة" };
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

// مهمة كتابة آيلتس (جدول/رسم أو مقال) أو توفل (نقاش أكاديمي): المؤقّت يبدأ عند أول كتابة،
// والتصحيح في الخلفية بمعيار المهمة، ثم الدرجة بمعاييرها والأخطاء والنصائح
export default function WritingTaskScreen({ taskId, onBack }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getWritingTask(taskId), [taskId]);
  const [text, setText] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const task = data?.task;
  useEffect(() => {
    if (attempt?.writing?.status !== "pending") return undefined;
    const t = setInterval(() => getAttempt(attempt.id).then(setAttempt).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [attempt?.id, attempt?.writing?.status]);
  const send = async () => { setBusy(true); setErr(""); try { setAttempt(await submitTaskWriting(taskId, text)); } catch (e) { setErr(e.message || "تعذّر الإرسال"); } finally { setBusy(false); } };
  const n = words(text);

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={task?.title || "كتابة"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  const w = attempt?.writing;
  if (w) return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      {w.status === "pending" && <div role="status" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, lineHeight: 1.8 }}>أُرسل نصّك. يصحّحه النموذج بمعايير {task.rubric.startsWith("toefl") ? "توفل" : "الآيلتس"} خلال نحو دقيقة، وتتحدّث الصفحة وحدها.</div>}
      {w.status === "done" && (
        <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5 }}>
          <div style={{ color: C.muted, fontSize: T.sm }}>{task.rubric.startsWith("toefl") ? "الدرجة من 5" : "درجة آيلتس تقريبية"}</div>
          <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: C.gold, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>{num(w.band ?? "—")}</div>
          {w.criteria && <div style={{ display: "flex", justifyContent: "center", gap: S.lg, flexWrap: "wrap", marginTop: S.x2 }}>
            {Object.entries(w.criteria).map(([k, v]) => <span key={k} className="madar-num" style={{ fontSize: T.sm, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>{CRIT[k] || k} {num(v)}</span>)}
          </div>}
        </div>
      )}
      <WritingFeedback writing={w} />
      {(data.history?.length > 0) && <div style={{ color: C.muted, fontSize: T.sm }}>محاولاتك السابقة: {data.history.map((h) => num(h.writing.band)).join(" · ")}</div>}
      <div style={{ display: "flex", gap: S.lg }}><Btn primary onClick={onBack}>عودة</Btn><Btn paper full={false} onClick={() => { setAttempt(null); setText(""); setStartedAt(null); }}>حاول من جديد</Btn></div>
    </div>,
  );

  return shell(
    <div style={{ display: "grid", gap: S.x3 }}>
      <div dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.lg, lineHeight: 1.7 }}>{task.prompt}</div>
      {task.data?.kind === "table" && <DataTable data={task.data} />}
      {task.data?.kind === "line" && <LineChart data={task.data} />}
      {task.posts?.map((p) => (
        <div key={p.who} dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, serif", lineHeight: 1.7 }}><b style={{ color: C.gold }}>{p.who}:</b> {p.text}</div>
      ))}
      {task.tips && <ul style={{ margin: 0, paddingInlineStart: S.x5, color: C.muted, fontSize: T.sm, lineHeight: 1.8 }}>{task.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      {startedAt ? <StageTimer timer={{ startedAt, budget: task.minutes * 60, now: Date.now() }} /> : <div style={{ color: C.muted, fontSize: T.sm }}>المؤقّت ({num(task.minutes)} دقيقة) يبدأ عند أول كلمة تكتبها.</div>}
      <div style={{ color: C.muted, fontSize: T.sm, textAlign: "end" }}>{num(n)} كلمة · المطلوب {num(task.words)} فأكثر</div>
      <textarea dir="ltr" value={text} onChange={(e) => { if (!startedAt) setStartedAt(new Date().toISOString()); setText(e.target.value); }} aria-label="نصّ الكتابة" rows={12} placeholder="Write here…" spellCheck={false}
        style={{ ...inputStyle, fontFamily: "Georgia, serif", fontSize: T.lg, lineHeight: 1.7, textAlign: "left", minHeight: 260, resize: "vertical" }} />
      <Btn primary disabled={busy || n < 20} onClick={send}>{busy ? "جارٍ الإرسال…" : "أرسل للتصحيح"}</Btn>
    </div>,
  );
}
