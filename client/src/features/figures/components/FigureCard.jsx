import { Check } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";
import { colorOf, lifeLabel, TIER_LABEL } from "./figures.meta";

// بطاقة شخصية في القائمة: الاسم، سطر العمر (الأنبياء بلا سنوات)، الفئة
// بلونها، وسطر «لماذا في القائمة»، وشارة «قُرئ» لمن بلغ آخر قصته.
export default function FigureCard({ figure, onOpen, read = false }) {
  const color = colorOf(figure.category);
  const years = figure.tier === "prophet" ? "" : lifeLabel(figure);
  return (
    <Card accent={color} onClick={onOpen} style={{ display: "grid", gap: S.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: S.lg }}>
        <div style={{ fontWeight: 700, fontSize: T.lg, minWidth: 0 }}>{figure.name}</div>
        {years && <div style={{ fontFamily: MONO, color: C.muted, fontSize: T.xs, flexShrink: 0 }}>{years}</div>}
      </div>
      <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.6 }}>{figure.why}</div>
      <div style={{ display: "flex", gap: S.md, flexWrap: "wrap", marginTop: S.xs, alignItems: "center" }}>
        <span style={{ fontSize: T.xs, fontWeight: 600, color, background: alpha(color, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{figure.category}</span>
        <span style={{ fontSize: T.xs, color: C.muted, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{TIER_LABEL[figure.tier] || figure.tier}</span>
        {read && (
          <span style={{ fontSize: T.xs, color: C.green, display: "inline-flex", alignItems: "center", gap: S.xs, marginInlineStart: "auto" }}>
            <Check size={13} aria-hidden="true" />قُرئ
          </span>
        )}
      </div>
    </Card>
  );
}
