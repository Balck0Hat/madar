import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { KIND } from "./nodeKinds";

// عقدة في رسم شبكي: أيقونة داخل دائرة، تُضاء حين تكون في الخطوة الحالية، واسم تحتها. HTML فوق SVG لتبقى حادّة.
export default function DiagramNode({ node, hot, hue = C.gold, compact = false }) {
  const [Icon, fallback] = KIND[node.kind] || KIND.pc;
  const size = compact ? (node.big ? 46 : 38) : node.big ? 64 : 52;
  return (
    <div style={{ position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)", display: "grid", justifyItems: "center", gap: S.xs, pointerEvents: "none", transition: "opacity .25s", opacity: hot === false ? 0.45 : 1 }}>
      <div style={{ width: size, height: size, borderRadius: R.pill, background: hot ? hue : C.surface, border: `2px solid ${hot ? hue : C.line}`, display: "grid", placeItems: "center", boxShadow: hot ? `0 0 0 6px ${alpha(hue, 0.2)}, 0 6px 14px ${alpha("#000", 0.25)}` : `0 2px 6px ${alpha("#000", 0.15)}`, transition: "background .25s, box-shadow .25s" }}>
        <Icon size={compact ? (node.big ? 22 : 18) : node.big ? 30 : 24} color={hot ? C.bg : C.text} aria-hidden="true" />
      </div>
      <div style={{ fontSize: T.xs, fontWeight: 700, color: C.text, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: `0 ${S.md}px`, whiteSpace: "nowrap" }}>{node.label || fallback}</div>
      {node.sub && (!compact || node.sub.length <= 14) && <div className="madar-num" style={{ fontSize: T.xs, color: C.muted, whiteSpace: "nowrap", direction: "ltr" }}>{node.sub}</div>}
    </div>
  );
}
