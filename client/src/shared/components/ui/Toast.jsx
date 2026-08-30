import { Sparkles } from "lucide-react";
import { C, T, R, S } from "../../constants/theme";

export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", bottom: "calc(86px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", background: C.gold, color: "var(--bg)", fontWeight: 700, padding: `${S.xl}px ${S.x4}px`, borderRadius: R.pill, boxShadow: "var(--shadow-2)", zIndex: 50, display: "flex", alignItems: "center", gap: S.lg, fontSize: T.md, whiteSpace: "nowrap" }}>
      <Sparkles size={16} />{msg}
    </div>
  );
}
