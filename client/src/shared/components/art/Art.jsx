import { C, P, alpha } from "../../constants/theme";
import { ART } from "./artPaths";

// لون الرسمة يأتي من المجال لا من الذهب دائماً: هذا ما يجعل كل مجال يُحسّ مختلفاً
export default function Art({ k, color = C.gold, height = 150, bg = P.panel }) {
  return (
    <div style={{ background: bg, borderRadius: 18, padding: "8px 12px", height, display: "grid", placeItems: "center", border: `1px solid ${alpha(color, 0.3)}`, position: "relative", overflow: "hidden" }}>
      {/* هالة خافتة بلون المجال تعطي عمقاً دون أن تنافس الخطوط */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 120%, ${alpha(color, 0.16)}, transparent 70%)` }} />
      <svg viewBox="0 0 200 120" width="100%" height="100%" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ maxWidth: 260, position: "relative" }}>
        {ART[k] || ART.wheel}
      </svg>
    </div>
  );
}
