import { ArrowRight } from "lucide-react";
import { C, P, T, R, S } from "../../constants/theme";

export default function TopBar({ title, onBack, right, paper }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${S.x3}px ${S.x4}px ${S.md}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.xl }}>
        {onBack && (
          <button type="button" onClick={onBack} aria-label="عودة" style={{ background: paper ? P.card : C.surface2, border: `1px solid ${paper ? P.line : C.line}`, borderRadius: R.lg, width: 38, height: 38, display: "grid", placeItems: "center", color: paper ? P.ink : C.text, cursor: "pointer" }}>
            <ArrowRight size={18} />
          </button>
        )}
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}
