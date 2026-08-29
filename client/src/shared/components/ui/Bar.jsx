import { C } from "../../constants/theme";

export default function Bar({ value, color = C.gold, h = 8, track = C.surface2 }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} style={{ background: track, borderRadius: 999, height: h, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width .6s ease" }} />
    </div>
  );
}
