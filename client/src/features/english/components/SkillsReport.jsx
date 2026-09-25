import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const tone = (rate) => (rate >= 80 ? C.green : rate < 60 ? C.red : C.gold);

function Bar({ row }) {
  const num = useNum();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: S.lg, alignItems: "center", fontSize: T.sm }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: S.lg, marginBottom: S.xs }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.label}</span>
          <span className="madar-num" style={{ color: C.muted, flexShrink: 0 }}>{num(row.ok)} من {num(row.n)}</span>
        </div>
        <div aria-hidden="true" style={{ height: 6, borderRadius: R.pill, background: alpha(C.text, 0.08), overflow: "hidden" }}>
          <div style={{ width: `${row.rate}%`, height: "100%", background: tone(row.rate), borderRadius: R.pill }} />
        </div>
      </div>
      <span className="madar-num" style={{ fontWeight: 700, color: tone(row.rate), minWidth: 40, textAlign: "end" }}>{num(row.rate)}٪</span>
    </div>
  );
}

// نقاط القوة والضعف: حسب موضوع السؤال (قواعد ومفردات) وحسب نوع السؤال (قراءة واستماع).
// الأحمر أقل من 60٪، الأخضر 80٪ فأكثر. اللون لا يُعتمد وحده: النسبة مكتوبة.
export default function SkillsReport({ skills, kinds }) {
  const topics = (skills?.all || []).filter((s) => s.n >= 1);
  const qkinds = (kinds || []).filter((k) => k.n >= 1);
  if (!topics.length && !qkinds.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.x2 }}>
      <div style={{ fontWeight: 700 }}>أين قوتك وأين ضعفك</div>
      {skills?.weak?.length > 0 && (
        <div style={{ fontSize: T.sm, color: C.muted, lineHeight: 1.8 }}>أضعف المواضيع: {skills.weak.map((s) => s.label).join("، ")}. ابدأ بها في خطة الأسبوعين أدناه.</div>
      )}
      {topics.length > 0 && (
        <div style={{ display: "grid", gap: S.lg }}>
          <div style={{ fontSize: T.xs, color: C.muted }}>القواعد والمفردات حسب الموضوع</div>
          {topics.map((row) => <Bar key={row.key} row={row} />)}
        </div>
      )}
      {qkinds.length > 0 && (
        <div style={{ display: "grid", gap: S.lg, marginTop: S.md }}>
          <div style={{ fontSize: T.xs, color: C.muted }}>القراءة والاستماع حسب نوع السؤال</div>
          {qkinds.map((row) => <Bar key={row.key} row={row} />)}
        </div>
      )}
    </div>
  );
}
