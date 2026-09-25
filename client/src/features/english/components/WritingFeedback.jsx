import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// تصحيح الكتابة كما جاء من المصحّح: ملخص، أهم الأخطاء بتصحيحها، ونصائح
export default function WritingFeedback({ writing: w }) {
  const num = useNum();
  if (!w) return null;
  if (w.status === "failed") return <div style={{ color: C.muted, fontSize: T.sm }}>تعذّر تصحيح الكتابة هذه المرة؛ النتيجة محسوبة من الأجزاء الأخرى.</div>;
  if (w.status !== "done") return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
      <div style={{ fontWeight: 700 }}>تصحيح الكتابة {w.ielts ? `· نحو ${num(w.ielts)} آيلتس` : ""}</div>
      {w.summary && <div style={{ lineHeight: 1.8 }}>{w.summary}</div>}
      {w.corrections?.map((e, i) => (
        <div key={i} style={{ borderInlineStart: `3px solid ${alpha(C.red, 0.5)}`, paddingInlineStart: S.x2, fontSize: T.sm, lineHeight: 1.8 }}>
          <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif" }}><s style={{ color: C.red }}>{e.quote}</s></div>
          <div dir="ltr" style={{ textAlign: "left", fontFamily: "Georgia, serif", color: C.green, fontWeight: 700 }}>{e.fix}</div>
          <div style={{ color: C.muted }}>{e.note}</div>
        </div>
      ))}
      {w.advice?.length > 0 && <ul style={{ margin: 0, paddingInlineStart: S.x5, color: C.text, fontSize: T.sm, lineHeight: 1.8 }}>{w.advice.map((a, i) => <li key={i}>{a}</li>)}</ul>}
    </div>
  );
}
