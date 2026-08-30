import { ArrowRight } from "lucide-react";
import { C, P, T, R } from "../../constants/theme";

export default function TopBar({ title, onBack, right, paper }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button type="button" onClick={onBack} aria-label="عودة" style={{ background: paper ? P.card : C.surface2, border: `1px solid ${paper ? P.line : C.line}`, borderRadius: R.lg, width: 38, height: 38, display: "grid", placeItems: "center", color: paper ? P.ink : C.text, cursor: "pointer" }}>
            <ArrowRight size={18} />
          </button>
        )}
        <div style={{ fontWeight: 800, fontSize: T.x2 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}
