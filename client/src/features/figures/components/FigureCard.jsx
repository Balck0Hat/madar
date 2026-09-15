import { Check } from "lucide-react";
import { C, MONO, READ, alpha, T, R, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";
import { colorOf, lifeLabel, TIER_LABEL } from "./figures.meta";
import { nameKey } from "../utils/figureText";

const THUMB = 64;

// صورة مصغّرة؛ وبلا صورة مربّع ملوّن فيه «نبي» للأنبياء (بلا صور عمداً) أو الحرف الأول
function Thumb({ figure, color }) {
  const box = { width: THUMB, height: THUMB, borderRadius: R.xl, flexShrink: 0, overflow: "hidden", border: `1px solid ${alpha(color, 0.3)}` };
  if (figure.image?.thumb || figure.image?.src) {
    return <img src={figure.image.thumb || figure.image.src} alt="" width={THUMB} height={THUMB} loading="lazy" decoding="async" style={{ ...box, objectFit: "cover", display: "block", background: C.surface2 }} />;
  }
  return (
    <div aria-hidden="true" style={{ ...box, background: alpha(color, 0.12), color, display: "grid", placeItems: "center", fontFamily: READ, fontWeight: 700, fontSize: T.md, textAlign: "center", lineHeight: 1.2, padding: S.sm }}>
      {figure.tier === "prophet" ? "نبي" : nameKey(figure.name).slice(0, 1)}
    </div>
  );
}

// بطاقة شخصية في القائمة: صورة، الاسم، سطر العمر (الأنبياء بلا سنوات)،
// سطر «لماذا في القائمة» بسطرين، الفئة بلونها، وشارة «قُرئ» لمن بلغ آخر قصته.
export default function FigureCard({ figure, onOpen, read = false }) {
  const color = colorOf(figure.category);
  const years = figure.tier === "prophet" ? "" : lifeLabel(figure);
  return (
    <Card accent={color} onClick={onOpen} style={{ display: "flex", gap: S.x3, alignItems: "flex-start" }}>
      <Thumb figure={figure} color={color} />
      <div style={{ minWidth: 0, flex: 1, display: "grid", gap: S.sm }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: S.lg }}>
          <div style={{ fontWeight: 700, fontSize: T.x2, minWidth: 0, lineHeight: 1.35 }}>{figure.name}</div>
          {read && <span style={{ fontSize: T.xs, color: C.green, display: "inline-flex", alignItems: "center", gap: S.xs, flexShrink: 0 }}><Check size={13} aria-hidden="true" />قُرئ</span>}
        </div>
        {years && <div style={{ fontFamily: MONO, color: C.muted, fontSize: T.xs }}>{years}</div>}
        <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{figure.why}</div>
        <div style={{ display: "flex", gap: S.md, flexWrap: "wrap", marginTop: S.xs }}>
          <span style={{ fontSize: T.xs, fontWeight: 600, color, background: alpha(color, 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{figure.category}</span>
          <span style={{ fontSize: T.xs, color: C.muted, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px` }}>{TIER_LABEL[figure.tier] || figure.tier}</span>
        </div>
      </div>
    </Card>
  );
}
