import { C, T, S } from "../../constants/theme";
import { DOMAINS } from "../../data/domains";
import { ring, RADII } from "./geometry";

// شاشة التحميل: العجلة ترسم نفسها قطاعاً قطاعاً — تعريف بالهوية من أول لحظة
export default function WheelLoader({ size = 200, label = "" }) {
  return (
    <div style={{ display: "grid", placeItems: "center", gap: S.x3 }}>
      <svg viewBox="0 0 360 360" width={size} height={size} aria-label="جارٍ التحميل" role="img">
        <circle cx="180" cy="180" r="168" fill="none" stroke={C.line} strokeWidth="1" />
        {DOMAINS.map((d, di) => {
          const [r0, r1] = RADII[0];
          const path = ring(r0, r1, di * 36 + 1.3, (di + 1) * 36 - 1.3);
          return <path key={d.id} className="madar-trace" pathLength="1" d={path} fill="none" stroke={d.color} strokeWidth="2" style={{ animationDelay: `${di * 0.07}s` }} />;
        })}
        <circle className="madar-trace" pathLength="1" cx="180" cy="180" r="40" fill="none" stroke={C.gold} strokeWidth="2" style={{ animationDelay: "0.7s" }} />
        <circle cx="180" cy="180" r="5" fill={C.gold} className="madar-pop" style={{ animationDelay: "1s", transformOrigin: "180px 180px" }} />
      </svg>
      {label && <div style={{ color: C.muted, fontSize: T.base }}>{label}</div>}
    </div>
  );
}
