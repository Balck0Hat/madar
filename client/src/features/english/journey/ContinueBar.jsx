import { ArrowLeft, Crown, LocateFixed } from "lucide-react";
import { C, R, S, T, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// «تابع رحلتك»: لوح صغير عائم أسفل الشاشة حين تكون المحطة الحالية ظاهرة،
// ويتقلّص إلى زر «موقعي» حين يبتعد الطالب يستكشف، فيعيده إليها.
export default function ContinueBar({ step, away, onContinue, onHome }) {
  const num = useNum();
  const wrap = { position: "fixed", insetInline: 0, bottom: `calc(${S.x4}px + env(safe-area-inset-bottom))`, zIndex: 20, display: "flex", justifyContent: "center", padding: `0 ${S.x4}px`, pointerEvents: "none" };
  if (away) {
    return (
      <div style={wrap}>
        <button type="button" onClick={onHome} style={{ pointerEvents: "auto", minHeight: TAP, display: "inline-flex", alignItems: "center", gap: S.md, padding: `0 ${S.x4}px`, borderRadius: R.pill, border: 0, background: C.gold, color: C.bg, fontFamily: "inherit", fontWeight: 700, fontSize: T.sm, boxShadow: "var(--shadow-3)", cursor: "pointer" }}>
          <LocateFixed size={16} aria-hidden="true" />عُد إلى موقعي
        </button>
      </div>
    );
  }
  if (!step) return null;
  const lesson = step.kind === "lesson";
  return (
    <div style={wrap}>
      <div role="region" aria-label="تابع رحلتك" className="madar-rise" style={{ pointerEvents: "auto", width: "100%", maxWidth: 460, display: "flex", alignItems: "center", gap: S.x2, background: C.surface, color: C.text, borderRadius: R.x3, padding: `${S.lg}px ${S.lg}px ${S.lg}px ${S.x3}px`, boxShadow: "var(--shadow-3)", border: `1px solid ${C.line}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.muted, fontSize: T.xs }}>تابع رحلتك</div>
          <div style={{ fontWeight: 700, fontSize: T.md, direction: "ltr", textAlign: "end", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson ? (step.node.en || step.node.title) : `${step.stage.en} Boss`}</div>
          <div style={{ color: C.muted, fontSize: T.xs, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson ? <>{step.node.title} · <span className="madar-num">{num(step.position)}/{num(step.stage.nodes.length)}</span></> : `${step.stage.title} · امتحان المحطة`}</div>
        </div>
        <button type="button" onClick={onContinue} style={{ minHeight: TAP, display: "inline-flex", alignItems: "center", gap: S.md, padding: `0 ${S.x3}px`, borderRadius: R.xl, border: 0, background: C.gold, color: C.bg, fontFamily: "inherit", fontWeight: 700, fontSize: T.md, cursor: "pointer", flexShrink: 0 }}>
          {lesson ? "تابع" : <><Crown size={16} aria-hidden="true" />ابدأ</>}{lesson && <ArrowLeft size={16} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
