import { useState } from "react";
import { Zap } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getDue, answerReview } from "../services/review.service";

// مراجعة الصباح: سؤالان لكل وحدة مستحقة؛ الوحدة تُعدّ صحيحة إذا أُجيب السؤالان
export default function ReviewScreen({ onBack, onDone }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(getDue, []);
  const [pos, setPos] = useState(0);
  const [sel, setSel] = useState(null);
  const [unitHits, setUnitHits] = useState({});
  const [gained, setGained] = useState(0);
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading || error) return <Shell onBack={onBack}>{error ? <ErrorState message={error.message} onRetry={reload} onBack={onBack} /> : <Skeleton lines={4} />}</Shell>;
  const flat = data.items.flatMap((it) => it.questions.map((q) => ({ ...q, unitId: it.unitId, title: it.title, perUnit: it.questions.length })));
  if (!flat.length) return <Shell onBack={onBack}><EmptyState title="لا مراجعة اليوم" text="أكملت مراجعاتك. تعود الوحدات إليك بعد يوم، ثم 3 أيام، ثم أسبوع." action="إلى الخريطة" onAction={onBack} /></Shell>;
  if (finished) {
    return (
      <Shell onBack={onBack}>
        <div style={{ textAlign: "center", padding: `${S.x7}px 0` }}>
          <div style={{ fontSize: T.x5, fontWeight: 700 }}>انتهت مراجعة اليوم</div>
          <div style={{ color: C.muted, marginTop: S.md }}>{num(data.items.length)} وحدات · <span style={{ color: C.gold, fontFamily: MONO, fontWeight: 700 }}><Zap size={13} /> +{num(gained)}</span></div>
          <div style={{ marginTop: S.x5 }}><Btn primary onClick={onDone}>العودة إلى الخريطة</Btn></div>
        </div>
      </Shell>
    );
  }
  const q = flat[pos], info = unitInfo(q.unitId), locked = sel !== null;
  const pick = async (v) => {
    if (locked || busy) return;
    setSel(v);
    const ok = v === q.a;
    vibrate(ok ? [20] : [40, 30, 40]);
    const hits = { ...unitHits, [q.unitId]: (unitHits[q.unitId] || 0) + (ok ? 1 : 0) };
    setUnitHits(hits);
    const lastOfUnit = pos + 1 === flat.length || flat[pos + 1].unitId !== q.unitId;
    if (lastOfUnit) {
      setBusy(true);
      try { const r = await answerReview(q.unitId, hits[q.unitId] === q.perUnit); setGained((g) => g + r.gain); } catch (err) { /* تُعرض النتيجة بلا نقاط؛ الخادم لم يسجّل */ } finally { setBusy(false); }
    }
  };
  const next = () => { if (pos + 1 < flat.length) { setPos(pos + 1); setSel(null); } else setFinished(true); };
  const options = q.t === "tf" ? [["صح", true], ["خطأ", false]] : q.opts.map((o, k) => [o, k]);
  return (
    <Shell onBack={onBack} right={<span style={{ fontFamily: MONO, color: C.muted, fontSize: T.sm }}>{num(pos + 1)}/{num(flat.length)}</span>}>
      <div style={{ color: info.color, fontSize: T.sm, fontWeight: 600 }}>{info.domainName} · {q.title}</div>
      <div style={{ fontSize: T.x3, fontWeight: 700, margin: `${S.lg}px 0 ${S.x4}px`, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "grid", gap: S.lg }}>
        {options.map(([label, v]) => {
          const right = locked && v === q.a, wrong = locked && v === sel && v !== q.a;
          return <button key={String(v)} type="button" className={wrong ? "madar-shake" : ""} onClick={() => pick(v)} style={{ background: right ? alpha(C.green, 0.2) : wrong ? alpha(C.red, 0.2) : C.surface, border: `1px solid ${right ? C.green : wrong ? C.red : C.line}`, borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px`, color: C.text, textAlign: "start", cursor: "pointer", fontSize: T.lg }}>{label}</button>;
        })}
      </div>
      {locked && <Card style={{ marginTop: S.x3 }}><div style={{ fontSize: T.md, lineHeight: 1.7 }}>{q.why}</div></Card>}
      <div style={{ marginTop: S.x4 }}>{locked && <Btn primary disabled={busy} onClick={next}>{pos + 1 < flat.length ? "التالي" : "إنهاء"}</Btn>}</div>
    </Shell>
  );
}

function Shell({ children, onBack, right }) {
  return (
    <div className="madar-in" style={{ minHeight: "100vh" }}>
      <TopBar title="مراجعة الصباح" onBack={onBack} right={right} />
      <div style={{ padding: `${S.lg}px ${S.x4}px ${S.x7}px` }}>{children}</div>
    </div>
  );
}
