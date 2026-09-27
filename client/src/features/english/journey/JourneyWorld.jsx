import { alpha } from "../../../shared/constants/theme";
import { WORLD, travelledPath } from "./journeyStages";
import JourneyStage from "./JourneyStage";

const ROAD_GLOW = "#ffd46b"; // ذهبي فاتح ثابت: الصورة لا تتبدّل مع السمة، وذهبي السمة الفاتحة داكن يختفي على الجسر

// العالم: الخلفية المرسومة والمحطات السبع فوقها كطبقة واحدة بنسبة الصورة نفسها، فتتحاذى مع أي عرض.
// الطريق المقطوع يضيء فوق الطريق المرسوم نفسه حتى المحطة الحالية؛ هو شريط التقدّم.
export default function JourneyWorld({ journey, selected, onSelect, refs }) {
  const path = travelledPath(journey.done ? journey.stages.length - 1 : journey.current);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: `${WORLD.w} / ${WORLD.h}` }}>
      <img src={WORLD.src} alt="رحلة القواعد: سبع منصّات على طريق صاعد بين جزر عائمة" width={WORLD.w} height={WORLD.h} fetchpriority="high" decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {path && (
        <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <path d={path} fill="none" style={{ stroke: alpha(ROAD_GLOW, 0.55) }} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" filter="url(#journeyGlow)" />
          <path d={path} fill="none" style={{ stroke: ROAD_GLOW }} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="world-draw" opacity={0.9} />
          <defs><filter id="journeyGlow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        </svg>
      )}
      {journey.stages.map((s) => (
        <JourneyStage key={s.id} stage={s} selected={selected === s.id} onSelect={onSelect} setRef={(el) => { refs.current[s.id] = el; }} />
      ))}
    </div>
  );
}
