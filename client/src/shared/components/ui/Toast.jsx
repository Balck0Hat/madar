import { Sparkles } from "lucide-react";
import { C, T, R } from "../../constants/theme";

export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", bottom: 86, left: "50%", transform: "translateX(-50%)", background: C.gold, color: "var(--bg)", fontWeight: 800, padding: "10px 16px", borderRadius: R.pill, boxShadow: "0 10px 30px rgba(0,0,0,.45)", zIndex: 50, display: "flex", alignItems: "center", gap: 8, fontSize: T.md, whiteSpace: "nowrap" }}>
      <Sparkles size={16} />{msg}
    </div>
  );
}
