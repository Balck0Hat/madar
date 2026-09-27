import { alpha } from "../../../../shared/constants/theme";

// القلعة المركزية «قواعد الإنجليزية»: جزيرة كبيرة، أبراج بأسقف مخروطية، نوافذ مضيئة، وكتاب مفتوح متوهّج
export default function CastleArt({ x, y }) {
  const tower = (tx, h, w = 26) => (
    <g key={tx} transform={`translate(${tx} 0)`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={3} style={{ fill: "#3b3f66" }} />
      <rect x={-w / 2 + 3} y={-h} width={5} height={h} style={{ fill: alpha("#fff", 0.12) }} />
      <path d={`M ${-w / 2 - 6} ${-h} L 0 ${-h - w * 1.2} L ${w / 2 + 6} ${-h} Z`} style={{ fill: "#5b3fa8" }} />
      <path d={`M ${-w / 2 - 6} ${-h} L 0 ${-h - w * 1.2} L 0 ${-h} Z`} style={{ fill: alpha("#fff", 0.14) }} />
      {[0.25, 0.55].map((k) => <rect key={k} x={-4} y={-h * k - 6} width={8} height={11} rx={2} style={{ fill: "#ffd37a" }} className="scene-glow" />)}
      <rect x={-2} y={-h - w * 1.2 - 14} width={4} height={14} style={{ fill: "#ffd37a" }} />
      <path d={`M 2 ${-h - w * 1.2 - 14} L 16 ${-h - w * 1.2 - 10} L 2 ${-h - w * 1.2 - 6} Z`} style={{ fill: "#f26b5b" }} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}><g className="scene-float" style={{ animationDuration: "9s" }}>
      <ellipse cx={0} cy={150} rx={210} ry={34} style={{ fill: alpha("#000", 0.3) }} />
      <path d="M -220 40 Q -200 150 -80 175 L -20 215 L 30 180 Q 190 160 220 40 Z" style={{ fill: "#2b2f45" }} />
      <ellipse cx={0} cy={44} rx={222} ry={70} style={{ fill: "#2f7a4d" }} />
      <ellipse cx={-10} cy={36} rx={200} ry={56} style={{ fill: "#3fa564" }} />
      <path className="scene-fall" d="M 120 60 Q 130 120 118 168" fill="none" style={{ stroke: "#9fd8ff" }} strokeWidth={9} strokeLinecap="round" />
      <path className="scene-fall" d="M -150 62 Q -160 120 -146 160" fill="none" style={{ stroke: "#9fd8ff", animationDelay: "-.6s" }} strokeWidth={7} strokeLinecap="round" />
      <rect x={-120} y={-70} width={240} height={110} rx={8} style={{ fill: "#33375a" }} />
      <rect x={-120} y={-70} width={240} height={14} style={{ fill: alpha("#fff", 0.1) }} />
      {[-95, -45, 5, 55].map((wx) => <rect key={wx} x={wx} y={-40} width={12} height={18} rx={3} style={{ fill: "#ffd37a" }} className="scene-glow" />)}
      {tower(-140, 120)}{tower(140, 120)}{tower(-60, 160, 30)}{tower(60, 160, 30)}{tower(0, 200, 34)}
      <path d="M -34 8 Q 0 -6 34 8 L 34 40 Q 0 26 -34 40 Z" style={{ fill: "#fff6d6" }} />
      <path d="M -34 8 Q -17 1 0 8 L 0 40 Q -17 33 -34 40 Z" style={{ fill: "#fbe7b0" }} />
      <circle cx={0} cy={22} r={70} style={{ fill: alpha("#ffd37a", 0.14) }} className="scene-glow" />
    </g></g>
  );
}
