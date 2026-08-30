import { useState } from "react";
import { Plus } from "lucide-react";
import { C, inputStyle, alpha, T, R, S } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getUnit, saveUnit } from "../services/admin.service";
import { emptyUnit, emptyQuestion, normalizeUnit, toFormUnit, toLines, fromLines } from "../utils/editor.utils";
import CardsEditor from "./CardsEditor";
import QuestionEditor from "./QuestionEditor";
import VersionsPanel from "./VersionsPanel";

const small = { ...inputStyle, padding: `${S.lg}px ${S.x2}px`, fontSize: T.md };
const Section = ({ title, children }) => <div style={{ display: "grid", gap: S.lg }}><div style={{ fontWeight: 700, color: C.gold, fontSize: T.md }}>{title}</div>{children}</div>;
const Lines = ({ label, value, onChange, rows = 3 }) => <div><div style={{ fontSize: T.sm, color: C.muted, fontWeight: 600, marginBottom: S.sm }}>{label}</div><textarea value={toLines(value)} onChange={(e) => onChange(fromLines(e.target.value))} rows={rows} style={{ ...small, resize: "vertical", lineHeight: 1.7 }} /></div>;

// محرّر وحدة كاملة: يحمّل الموجود أو يبدأ من قالب فارغ
export default function UnitEditor({ unitId, isNew, onBack, onSaved, onToast }) {
  const { data, loading, error, reload } = useAsync(() => (isNew ? Promise.resolve(emptyUnit(unitId)) : getUnit(unitId)), [unitId, isNew]);
  if (loading || error) return <Shell unitId={unitId} onBack={onBack}>{error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton lines={6} />}</Shell>;
  return <Shell unitId={unitId} onBack={onBack}><Form initial={data} unitId={unitId} isNew={isNew} onSaved={onSaved} onToast={onToast} /></Shell>;
}

function Form({ initial, unitId, isNew, onSaved, onToast }) {
  const [u, setU] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (patch) => setU((x) => ({ ...x, ...patch }));
  const save = async (published) => {
    setBusy(true); setErr("");
    try {
      const saved = await saveUnit(unitId, normalizeUnit({ ...u, published }));
      setU((x) => ({ ...x, published: saved.published }));
      onToast(published ? "نُشرت الوحدة" : "حُفظت كمسودة");
      onSaved();
    } catch (e) {
      setErr(e.details ? Object.entries(e.details).map(([k, v]) => `${k}: ${v[0]}`).join(" · ") : e.message);
    } finally { setBusy(false); }
  };
  return (
    <div style={{ display: "grid", gap: S.x4 }}>
      <Section title="الأساس">
        <input aria-label="العنوان" value={u.title} onChange={(e) => set({ title: e.target.value })} placeholder="عنوان الوحدة" style={small} />
        <div style={{ display: "flex", gap: S.lg }}>
          <input aria-label="رقم البطل" value={u.hero?.num || ""} onChange={(e) => set({ hero: { ...u.hero, num: e.target.value } })} placeholder="رقم لافت (25)" style={{ ...small, width: 110 }} />
          <input aria-label="وصف الرقم" value={u.hero?.label || ""} onChange={(e) => set({ hero: { ...u.hero, label: e.target.value } })} placeholder="وصف الرقم" style={small} />
        </div>
        <textarea aria-label="الشرارة" value={u.spark || ""} onChange={(e) => set({ spark: e.target.value })} placeholder="الشرارة: سؤال أو حقيقة مدهشة" rows={3} style={{ ...small, resize: "vertical", lineHeight: 1.7 }} />
        <Lines label="الأهداف (سطر لكل هدف)" value={u.goals} onChange={(goals) => set({ goals })} />
      </Section>
      <Section title={`البطاقات (${u.cards.length})`}><CardsEditor cards={u.cards} onChange={(cards) => set({ cards })} /></Section>
      <Section title="جرّب والتعمّق">
        <input aria-label="عنوان التمرين" value={u.tryIt?.title || ""} onChange={(e) => set({ tryIt: { ...u.tryIt, title: e.target.value } })} placeholder="عنوان التمرين" style={small} />
        <textarea aria-label="نص التمرين" value={u.tryIt?.text || ""} onChange={(e) => set({ tryIt: { ...u.tryIt, text: e.target.value } })} placeholder="نص التمرين" rows={2} style={{ ...small, resize: "vertical" }} />
        <input aria-label="مرجع التعمق" value={u.deep?.title || ""} onChange={(e) => set({ deep: { ...u.deep, title: e.target.value } })} placeholder="مرجع التعمّق (كتاب/محاضرة)" style={small} />
        <textarea aria-label="لماذا اخترناه" value={u.deep?.why || ""} onChange={(e) => set({ deep: { ...u.deep, why: e.target.value } })} placeholder="لماذا اخترناه" rows={2} style={{ ...small, resize: "vertical" }} />
      </Section>
      <Section title="الخلاصة"><Lines label="سطر لكل نقطة (3 إلى 5)" value={u.summary} onChange={(summary) => set({ summary })} rows={4} /></Section>
      <Section title={`بنك الأسئلة (${u.questions.length})`}>
        {u.questions.map((q, k) => <QuestionEditor key={k} q={q} index={k} onChange={(nq) => set({ questions: u.questions.map((x, j) => (j === k ? nq : x)) })} onRemove={() => set({ questions: u.questions.filter((_, j) => j !== k) })} />)}
        <Btn small full={false} onClick={() => set({ questions: [...u.questions, emptyQuestion(u.questions.length + 1)] })}><span style={{ display: "inline-flex", gap: S.md, alignItems: "center" }}><Plus size={14} />سؤال جديد</span></Btn>
      </Section>
      {!isNew && <VersionsPanel unitId={unitId} current={u} onToast={onToast} onRestored={(unit) => { setU(toFormUnit(unit)); onSaved(); }} />}
      {err && <div role="alert" style={{ color: C.red, fontSize: T.base, background: alpha(C.red, 0.12), border: `1px solid ${alpha(C.red, 0.4)}`, borderRadius: R.lg, padding: S.xl }}>{err}</div>}
      <div style={{ display: "flex", gap: S.lg, position: "sticky", bottom: 12 }}>
        <Btn disabled={busy} onClick={() => save(false)}>حفظ كمسودة</Btn>
        <Btn primary disabled={busy} onClick={() => save(true)}>{busy ? "لحظة..." : "نشر"}</Btn>
      </div>
    </div>
  );
}

function Shell({ unitId, onBack, children }) {
  return <div className="madar-in" style={{ paddingBottom: S.x8 }}><TopBar title={<span style={{ fontSize: T.lg }}>تحرير <span style={{ color: C.muted, fontWeight: 400 }}>{unitId}</span></span>} onBack={onBack} /><div style={{ padding: `0 ${S.x4}px` }}>{children}</div></div>;
}
