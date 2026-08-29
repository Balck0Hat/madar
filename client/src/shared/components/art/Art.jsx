import { C, P } from "../../constants/theme";
import { ART } from "./artPaths";

export default function Art({ k, color = C.gold, height = 150, bg = P.panel }) {
  return (
    <div style={{ background: bg, borderRadius: 18, padding: "8px 12px", height, display: "grid", placeItems: "center", border: `1px solid ${C.line}` }}>
      <svg viewBox="0 0 200 120" width="100%" height="100%" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ maxWidth: 260 }}>
        {ART[k] || ART.wheel}
      </svg>
    </div>
  );
}
