import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";
import { colorOf, lifeLabel, TIER_LABEL } from "./figures.meta";

// بطاقة شخصية في القائمة: الاسم، سطر العمر، الفئة بلونها، وسطر «لماذا في القائمة»
export default function FigureCard({ figure, onOpen }) {
  const color = colorOf(figure.category);
  return (
    <Card accent={color} onClick={onOpen} style={{ display: "grid", gap: S.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: S.lg }}>
        <div style={{ fontWeight: 700, fontSize: T.lg, minWidth: 0 }}>{figure.name}</div>
        <div style={{ fontFamily: MONO, color: C.muted, fontSize: T.xs, flexShrink: 0 }}>{lifeLabel(figure)}</div>
      </div>
      <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.6 }}>{figure.why}</div>
      <div style={{ display: "flex", gap: S.md, flexWrap: "wrap", marginTop: S.xs }}>
        <span style={{ fontSize: T.xs, fontWeight: 600, color, background: alpha(color, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{figure.category}</span>
        <span style={{ fontSize: T.xs, color: C.muted, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{TIER_LABEL[figure.tier] || figure.tier}</span>
      </div>
    </Card>
  );
}
