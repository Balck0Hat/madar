import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { WORLD } from "./journeyStages";

const INK = "#ffffff"; // نصّ فوق الصورة: ثابت لأن الصورة لا تتبدّل مع السمة
const SHADE = "#0b1030";
const GLOW = "#ffd46b";
const SHRINK = 0.8; // المعالم أصغر من المنصّة قليلاً فيبقى حولها متنفّس

// محطة فوق منصّتها: المعلم ثابت بلا حركة، والحالية وحدها بكامل الإضاءة مع هالة وعلامة «أنت هنا» مضيئة.
// المستقبلية أهدأ تدريجياً بالتشبّع لا بالشفافية. لافتة واحدة صغيرة: رقم واسم إنجليزي، والتفاصيل عند الضغط.
export default function JourneyStage({ stage, selected, onSelect, setRef }) {
  const { x, y, w, n, asset, scale = 1, base = [0.5, 0.75, 0.95], label: spot = null } = stage.art;
  const fit = ((0.96 * SHRINK) / base[2]) * scale;
  const current = stage.status === "current", completed = stage.status === "completed";
  const calm = current || completed ? 0 : Math.min(0.45, 0.12 + stage.distance * 0.08);
  const pos = (dy = 0) => ({ position: "absolute", left: `${x * 100}%`, top: `${(y + dy) * 100}%` });
  const tag = spot ? { position: "absolute", left: `${(spot[0] / WORLD.w) * 100}%`, top: `${(spot[1] / WORLD.h) * 100}%` } : pos(0.05); // مكان مفتوح بجانب المنصّة لا فوق الطريق
  const status = completed ? "مكتملة" : current ? "أنت هنا" : stage.status === "next" ? "التالية" : "مقفلة";
  return (
    <>
      {current && <div aria-hidden="true" className="journey-ring" style={{ ...pos(), width: `${w * 105}%`, aspectRatio: "2.4 / 1", transform: "translate(-50%, -50%)", borderRadius: R.pill, border: `3px solid ${GLOW}`, boxShadow: `0 0 28px ${alpha(GLOW, 0.8)}, inset 0 0 20px ${alpha(GLOW, 0.5)}`, pointerEvents: "none" }} />}
      {asset && (
        <img src={asset} alt="" aria-hidden="true" loading={stage.distance > 2 ? "lazy" : "eager"}
          style={{ ...pos(), width: `${w * 100 * fit}%`, transform: `translate(-${base[0] * 100}%, -${base[1] * 100}%)`, pointerEvents: "none", filter: calm ? `saturate(${1 - calm}) brightness(${1 - calm / 4})` : current ? `drop-shadow(0 0 14px ${alpha(GLOW, 0.65)})` : undefined }} />
      )}
      {current && (
        <div aria-hidden="true" style={{ ...pos(-0.085), transform: "translate(-50%, -50%)", pointerEvents: "none", display: "grid", placeItems: "center" }}>
          <span className="journey-beacon" style={{ width: S.x4, height: S.x4, borderRadius: R.pill, background: GLOW, border: `3px solid ${INK}`, boxShadow: `0 0 0 6px ${alpha(GLOW, 0.35)}, 0 0 18px ${GLOW}` }} />
        </div>
      )}
      <button ref={setRef} type="button" onClick={() => onSelect(stage)} aria-label={`${n} · ${stage.en} · ${stage.title} · ${status}`} aria-pressed={selected}
        style={{ ...pos(), width: `${w * 100}%`, aspectRatio: "1.8 / 1", transform: "translate(-50%, -55%)", background: "transparent", border: 0, borderRadius: R.pill, cursor: "pointer", outlineOffset: S.xs }} />
      <div aria-hidden="true" dir="ltr" style={{ ...tag, transform: "translate(-50%, 0)", pointerEvents: "none", textAlign: "center", lineHeight: 1.15, color: INK, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, background: alpha(SHADE, current ? 0.78 : 0.62), border: `1px solid ${alpha(current || selected ? GLOW : INK, current || selected ? 0.9 : 0.25)}`, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", boxShadow: `0 4px 12px ${alpha(SHADE, 0.35)}` }}>
        <div className="madar-num" style={{ fontSize: T.xs, fontWeight: 700, letterSpacing: 1, color: current || selected ? GLOW : INK }}>{String(n).padStart(2, "0")}</div>
        <div style={{ fontSize: current ? T.md : T.sm, fontWeight: 700, whiteSpace: "nowrap", color: calm ? alpha(INK, 1 - calm / 2) : INK }}>{stage.en}</div>
      </div>
    </>
  );
}
