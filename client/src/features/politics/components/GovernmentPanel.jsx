import { UserRound, Vote, Hourglass, Landmark, Info } from "lucide-react";
import { P, R, S, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const Ruler = ({ r, color }) => {
  const num = useNum();
  return (
    <div style={{ flex: "1 1 46%", minWidth: 0, background: P.card, border: `1px solid ${P.line}`, borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px` }}>
      <div style={{ color, fontSize: ".75em", fontWeight: 700 }}>{r.title}</div>
      <div style={{ fontWeight: 700, fontSize: "1.02em", lineHeight: 1.5, marginTop: S.xs }}>{r.name}</div>
      {r.since && <div style={{ color: P.muted, fontSize: ".78em", marginTop: S.xs }}>منذ {num(r.since)}</div>}
    </div>
  );
};

const Row = ({ Icon, label, text, color }) => (text ? (
  <div style={{ display: "flex", gap: S.x2, alignItems: "flex-start" }}>
    <Icon size={16} color={color} aria-hidden="true" style={{ flexShrink: 0, marginTop: S.sm }} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: ".82em" }}>{label}</div>
      <div style={{ fontSize: ".95em", lineHeight: 1.8, color: P.ink }}>{text}</div>
    </div>
  </div>
) : null);

// «كيف تُحكم»: قلب ملف الدولة. من يحكم الآن بلقبه ومنذ متى، ثم الآلية:
// كيف يصل إلى المنصب، وكم مدته، ومن يشرّع. وصف لا حكم.
export default function GovernmentPanel({ government: g, color, asOf }) {
  const num = useNum();
  if (!g) return null;
  return (
    <section aria-label="كيف تُحكم" style={{ border: `1px solid ${alpha(color, 0.35)}`, background: alpha(color, 0.05), borderRadius: R.x3, padding: S.x4, display: "grid", gap: S.x3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "1.15em", fontWeight: 700, margin: 0, flex: 1 }}>كيف تُحكم</h2>
        <span style={{ fontSize: ".78em", fontWeight: 700, color, background: alpha(color, 0.14), borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}>{g.type}</span>
      </div>
      <div style={{ display: "flex", gap: S.lg, flexWrap: "wrap" }}>
        {g.headOfState && <Ruler r={g.headOfState} color={color} />}
        {g.headOfGovernment && <Ruler r={g.headOfGovernment} color={color} />}
      </div>
      <Row Icon={Vote} label="كيف يصل إلى المنصب" text={g.how} color={color} />
      <Row Icon={Hourglass} label="المدة" text={g.term} color={color} />
      <Row Icon={Landmark} label="السلطة التشريعية" text={g.legislature} color={color} />
      <Row Icon={Info} label="ملاحظة" text={g.note} color={color} />
      {asOf && <div style={{ color: P.muted, fontSize: ".75em", display: "flex", alignItems: "center", gap: S.md }}><UserRound size={13} aria-hidden="true" />الأسماء كما تحقّقنا منها في {num(asOf)}</div>}
    </section>
  );
}
