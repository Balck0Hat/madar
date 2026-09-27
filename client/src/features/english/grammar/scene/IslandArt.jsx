import { C, alpha } from "../../../../shared/constants/theme";

// جزيرة طافية مرسومة بالمتجهات: صخر بطبقتين، عشب، شلال منساب، بناء رمزي (أيقونة كبيرة على منصة)،
// مصابيح متوهجة، ولافتة الاسم. تُرسم داخل SVG المشهد بإحداثيات مرساتها.
export default function IslandArt({ x, y, r, hue, Icon, dim }) {
  const w = r * 2, top = -r * 0.42;
  const rock = `M ${-r} ${top + 10} Q ${-r * 0.9} ${r * 0.5} ${-r * 0.35} ${r * 0.72} L ${-r * 0.1} ${r * 1.05} L ${r * 0.15} ${r * 0.75} Q ${r * 0.8} ${r * 0.55} ${r} ${top + 14} Z`;
  return (
    <g transform={`translate(${x} ${y})`} style={{ opacity: dim ? 0.45 : 1, transition: "opacity .2s" }}><g className="scene-float" style={{ animationDelay: `${(x + y) % 7}s` }}>
      <ellipse cx={0} cy={r * 0.95} rx={r * 0.9} ry={r * 0.16} style={{ fill: alpha("#000", 0.28) }} />
      <path d={rock} style={{ fill: "#2b2f45" }} />
      <path d={`M ${-r} ${top + 10} Q ${-r * 0.5} ${top + 60} ${0} ${top + 40} Q ${r * 0.5} ${top + 20} ${r} ${top + 14} L ${r * 0.85} ${r * 0.2} Q ${0} ${r * 0.05} ${-r * 0.85} ${r * 0.22} Z`} style={{ fill: "#3a3f5c" }} />
      <ellipse cx={0} cy={top + 26} rx={r} ry={r * 0.38} style={{ fill: "#2f7a4d" }} />
      <ellipse cx={-r * 0.1} cy={top + 18} rx={r * 0.86} ry={r * 0.3} style={{ fill: "#3fa564" }} />
      <ellipse cx={-r * 0.25} cy={top + 12} rx={r * 0.5} ry={r * 0.16} style={{ fill: alpha("#bfe98a", 0.55) }} />
      <path className="scene-fall" d={`M ${r * 0.62} ${top + 40} Q ${r * 0.66} ${r * 0.4} ${r * 0.58} ${r * 0.8}`} fill="none" style={{ stroke: "#9fd8ff" }} strokeWidth={7} strokeLinecap="round" opacity={0.9} />
      <path className="scene-fall" d={`M ${r * 0.62} ${top + 40} Q ${r * 0.66} ${r * 0.4} ${r * 0.58} ${r * 0.8}`} fill="none" style={{ stroke: "#ffffff", animationDelay: "-.8s" }} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
      <ellipse cx={r * 0.58} cy={r * 0.84} rx={14} ry={5} style={{ fill: alpha("#dff6ff", 0.7) }} className="scene-shimmer" />
      {[-0.55, 0.42].map((k, i) => (
        <g key={i} transform={`translate(${k * r} ${top - 6})`}>
          <rect x={-1.5} y={0} width={3} height={22} style={{ fill: "#6b7092" }} />
          <circle cx={0} cy={-2} r={5} style={{ fill: "#ffd37a" }} className="scene-glow" />
          <circle cx={0} cy={-2} r={12} style={{ fill: alpha("#ffd37a", 0.25) }} className="scene-glow" />
        </g>
      ))}
      <rect x={-r * 0.42} y={top - r * 0.5} width={r * 0.84} height={r * 0.52} rx={10} style={{ fill: hue, filter: "brightness(.85)" }} />
      <rect x={-r * 0.36} y={top - r * 0.56} width={r * 0.72} height={r * 0.52} rx={10} style={{ fill: hue }} />
      <rect x={-r * 0.36} y={top - r * 0.56} width={r * 0.72} height={r * 0.12} rx={6} style={{ fill: alpha("#fff", 0.25) }} />
      <svg x={-r * 0.2} y={top - r * 0.5} width={r * 0.4} height={r * 0.4} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><Icon /></svg>
      <circle cx={0} cy={top - r * 0.3} r={r * 0.5} style={{ fill: alpha(hue, 0.18) }} className="scene-glow" />
    </g></g>
  );
}
