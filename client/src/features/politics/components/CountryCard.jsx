import { C, alpha, T, R, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";
import Flag from "./Flag";

// بطاقة دولة: العلم، الاسم والعاصمة، نوع الحكم بلونه، ومن يحكم الآن بلقبه
export default function CountryCard({ country: c, color = C.gold, onOpen }) {
  const g = c.government || {};
  const rulers = [g.headOfState, g.headOfGovernment].filter(Boolean);
  return (
    <Card accent={color} onClick={onOpen} style={{ display: "flex", gap: S.x3, alignItems: "flex-start" }}>
      <Flag country={c} width={48} />
      <div style={{ minWidth: 0, flex: 1, display: "grid", gap: S.sm }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: S.lg }}>
          <div style={{ fontWeight: 700, fontSize: T.x2, lineHeight: 1.35 }}>{c.name}</div>
          <div style={{ color: C.muted, fontSize: T.xs, flexShrink: 0 }}>{c.capital}</div>
        </div>
        {rulers.map((r) => (
          <div key={r.title} style={{ fontSize: T.sm, lineHeight: 1.5 }}>
            <span style={{ color: C.muted }}>{r.title}: </span><span style={{ fontWeight: 600 }}>{r.name}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: S.md, flexWrap: "wrap", marginTop: S.xs }}>
          <span style={{ fontSize: T.xs, fontWeight: 600, color, background: alpha(color, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{g.type}</span>
          <span style={{ fontSize: T.xs, color: C.muted, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{g.form}</span>
        </div>
      </div>
    </Card>
  );
}
