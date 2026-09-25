import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";

const PART = { grammar: "القواعد والمفردات", reading: "القراءة", listening: "الاستماع", writing: "الكتابة" };

// النتيجة: المستوى الأوروبي كبيراً، ثم ما يقابله تقريباً في الآيلتس والتوفل،
// ثم كل مهارة، ثم تصحيح الكتابة إن جاء، ثم التوصية
export default function ResultView({ result, writing, onRetake, onGo }) {
  const num = useNum();
  if (!result) return <div style={{ color: C.muted }}>لم تكتمل الجلسة بما يكفي لتقدير المستوى.</div>;
  const w = writing || {};
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5, boxShadow: "var(--shadow-1)" }}>
        <div style={{ color: C.muted, fontSize: T.sm }}>مستواك التقريبي</div>
        <div style={{ fontSize: T.display, fontWeight: 700, color: C.gold, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>{result.level}</div>
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>{result.label}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: S.x3, marginTop: S.x2, flexWrap: "wrap" }}>
          <span style={{ fontSize: T.sm, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>آيلتس نحو {num(result.ielts)}</span>
          <span style={{ fontSize: T.sm, background: alpha(C.gold, 0.12), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>توفل نحو {num(result.toefl)}</span>
        </div>
        <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.x2, lineHeight: 1.7 }}>تقدير من اختبار قصير لا درجة رسمية؛ الامتحان الحقيقي أطول وأدق.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: S.lg }}>
        {Object.entries(PART).map(([k, label]) => (
          <div key={k} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: T.xs }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: T.x3, fontFamily: "Georgia, serif" }}>{result.parts?.[k] || (k === "writing" ? (w.status === "pending" ? "…" : "—") : "—")}</div>
            {k === "writing" && w.status === "pending" && <div style={{ color: C.muted, fontSize: T.xs }}>جارٍ التصحيح</div>}
          </div>
        ))}
      </div>
      {w.status === "done" && (
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
          <div style={{ fontWeight: 700 }}>تصحيح الكتابة {w.ielts ? `· نحو ${num(w.ielts)} آيلتس` : ""}</div>
          {w.summary && <div style={{ lineHeight: 1.8 }}>{w.summary}</div>}
          {w.corrections?.map((e, i) => (
            <div key={i} style={{ borderInlineStart: `3px solid ${alpha(C.red, 0.5)}`, paddingInlineStart: S.x2, fontSize: T.sm, lineHeight: 1.8 }}>
              <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif" }}><s style={{ color: C.red }}>{e.quote}</s> → <b style={{ color: C.green }}>{e.fix}</b></div>
              <div style={{ color: C.muted }}>{e.note}</div>
            </div>
          ))}
          {w.advice?.length > 0 && <ul style={{ margin: 0, paddingInlineStart: S.x5, color: C.text, fontSize: T.sm, lineHeight: 1.8 }}>{w.advice.map((a, i) => <li key={i}>{a}</li>)}</ul>}
        </div>
      )}
      {w.status === "failed" && <div style={{ color: C.muted, fontSize: T.sm }}>تعذّر تصحيح الكتابة هذه المرة؛ النتيجة محسوبة من الأجزاء الأخرى.</div>}
      {result.recommendation && (
        <div style={{ background: alpha(C.gold, 0.08), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.x2, padding: S.x3, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: S.sm }}>من أين تبدأ</div>{result.recommendation.text}
        </div>
      )}
      <div style={{ display: "flex", gap: S.lg }}>
        {onGo && <Btn primary onClick={() => onGo(result.recommendation?.track)}>افتح المسار المقترح</Btn>}
        <Btn paper full={false} onClick={onRetake}>أعد الاختبار</Btn>
      </div>
    </div>
  );
}
