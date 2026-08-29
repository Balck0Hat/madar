import { C } from "../../constants/theme";

export default function OrbitMark({ size = 110 }) {
  return (
    <svg className="madar-spin" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ display: "block", margin: "0 auto 18px" }}>
      {[18, 30, 42].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={C.gold} strokeOpacity="0.55" strokeWidth="0.8" />)}
      <circle cx="50" cy="50" r="5" fill={C.gold} /><circle cx="50" cy="8" r="3" fill={C.gold} /><circle cx="80" cy="50" r="2" fill={C.text} />
    </svg>
  );
}
