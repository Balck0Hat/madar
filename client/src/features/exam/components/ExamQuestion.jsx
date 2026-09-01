import { C, inputStyle, alpha, T, R, S } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import OrderQuestion from "../../quiz/components/OrderQuestion";

// سؤال واحد. لا يفرض إجابة: ترك السؤال فارغاً والعودة إليه لاحقاً مسموح،
// وكانت الواجهة تعطّل «التالي» حتى يُجاب، فيعلق المتعلّم عند سؤال صعب.
export default function ExamQuestion({ q, value, onChange }) {
  const info = unitInfo(q.unitId);
  const opt = (label, v) => (
    <button
      key={String(v)} type="button" onClick={() => onChange(v)} aria-pressed={value === v}
      style={{
        background: value === v ? alpha(info.color, 0.15) : C.surface,
        border: `1px solid ${value === v ? info.color : C.line}`,
        borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px`, color: C.text,
        textAlign: "start", cursor: "pointer", fontSize: T.lg, minHeight: 44,
      }}
    >
      {label}
    </button>
  );
  return (
    <>
      <div style={{ color: info.color, fontSize: T.sm, fontWeight: 600, marginTop: S.x2 }}>{info.domainName}</div>
      <div style={{ fontSize: T.x3, fontWeight: 700, margin: `${S.lg}px 0 ${S.x4}px`, lineHeight: 1.6 }}>{q.q}</div>
      <div style={{ display: "grid", gap: S.lg }}>
        {q.t === "mcq" && q.opts.map((o, k) => opt(o, k))}
        {q.t === "tf" && [["صح", true], ["خطأ", false]].map(([l, v]) => opt(l, v))}
        {q.t === "fill" && (
          <input aria-label="إجابتك" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب إجابتك" style={inputStyle} />
        )}
        {q.t === "order" && (
          <OrderQuestion items={q.items} sel={value ?? null} color={info.color} locked={false} onChange={onChange} />
        )}
      </div>
    </>
  );
}
