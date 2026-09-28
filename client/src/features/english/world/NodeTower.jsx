import { Lock, Check, MapPin, Sparkles } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// عقدة على الجزيرة: زر HTML فوق الرسم (حلقة تركيز، حجم لمس، نبض) بثلاث حالات:
// مقفلة (رمادية بقفل)، متاحة (حلقة ذهبية)، متقنة (برج ذهبي بعلامة). مهمة اليوم تنبض،
// واللاعب دبوس فوق عقدته، والأصدقاء نقاط صغيرة بأسمائهم.
export default function NodeTower({ node, pos, tone, quest, player, friends = [], focused, onOpen, index }) {
  const num = useNum();
  const mastered = node.status === "mastered", locked = node.status === "locked";
  const color = mastered ? C.gold : locked ? C.muted : tone;
  const label = `${node.title}${mastered ? " · متقن" : locked ? " · مقفل" : ""}${node.pct !== null ? ` · ${node.pct}٪` : ""}`;
  return (
    <div className={`world-rise${quest ? " world-quest" : ""}`} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)", animationDelay: `${index * 60}ms`, borderRadius: R.pill }}>
      <button type="button" className="world-node madar-press" aria-label={label} aria-current={player ? "location" : undefined} onClick={() => onOpen(node.tag)}
        style={{ position: "relative", width: TAP, height: TAP, borderRadius: R.pill, border: `3px solid ${color}`, background: mastered ? C.gold : locked ? C.surface2 : C.surface, color: mastered ? C.bg : color, display: "grid", placeItems: "center", cursor: "pointer", boxShadow: focused ? `0 0 0 6px ${alpha(color, 0.25)}, 0 10px 18px ${alpha("#000", 0.25)}` : `0 6px 12px ${alpha("#000", 0.22)}`, transform: focused ? "translateY(-4px) scale(1.12)" : undefined, filter: locked ? "saturate(.4)" : undefined }}>
        {mastered ? <Check size={20} strokeWidth={3} aria-hidden="true" /> : locked ? <Lock size={16} aria-hidden="true" /> : quest ? <Sparkles size={18} aria-hidden="true" /> : <span className="madar-num" style={{ fontWeight: 700, fontSize: T.sm }}>{num(index + 1)}</span>}
        {mastered && <span aria-hidden="true" style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 14, height: 10, background: C.gold, borderRadius: `${R.sm}px ${R.sm}px 0 0`, boxShadow: `0 -3px 0 ${alpha(C.gold, 0.5)}` }} />}
        {player && <MapPin size={22} color={C.red} fill={C.red} aria-hidden="true" className="world-walk" style={{ position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)" }} />}
      </button>
      <div aria-hidden="true" style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: S.xs, whiteSpace: "nowrap", fontSize: T.xs, fontWeight: 700, color: locked ? C.muted : C.text, background: alpha(C.surface, 0.85), borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px` }}>
        <span dir="ltr">{node.en || node.title}</span>{node.pct !== null && !mastered ? <span className="madar-num" style={{ color: C.muted }}> {num(node.pct)}٪</span> : null}
      </div>
      {friends.length > 0 && (
        <div aria-hidden="true" style={{ position: "absolute", bottom: "100%", insetInlineEnd: -6, display: "flex", gap: 2, marginBottom: 2 }}>
          {friends.slice(0, 3).map((f) => <span key={f} title={f} style={{ width: 10, height: 10, borderRadius: R.pill, background: C.green, border: `2px solid ${C.bg}` }} />)}
        </div>
      )}
    </div>
  );
}
