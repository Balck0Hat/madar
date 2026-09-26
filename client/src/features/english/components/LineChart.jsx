import { C, R, S, T } from "../../../shared/constants/theme";

const SERIES = [C.gold, C.green, C.red, C.blue || C.muted];
const W = 560, H = 300, PAD = { t: 20, r: 20, b: 44, l: 44 };

// رسم خطي بسيط بـSVG لمهمة الآيلتس الأولى: محوران بعناوين، وسيلة إيضاح، ورموز مختلفة لكل سلسلة
// (دائرة/مربع/معيّن) فلا يُعتمد اللون وحده.
export default function LineChart({ data }) {
  const { x, series, caption, yLabel = "" } = data;
  const all = series.flatMap((s) => s.values);
  const max = Math.ceil(Math.max(...all) * 1.1), min = Math.min(0, ...all);
  const px = (i) => PAD.l + (i / (x.length - 1)) * (W - PAD.l - PAD.r);
  const py = (v) => PAD.t + ((max - v) / (max - min)) * (H - PAD.t - PAD.b);
  const ticks = 5;
  const mark = (k, cx, cy) => (k === 0 ? <circle cx={cx} cy={cy} r={4} /> : k === 1 ? <rect x={cx - 4} y={cy - 4} width={8} height={8} /> : <polygon points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`} />);
  return (
    <figure dir="ltr" style={{ margin: 0, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3 }}>
      <figcaption style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: T.base, marginBottom: S.lg, textAlign: "left" }}>{caption}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} style={{ width: "100%", height: "auto", fontFamily: "Georgia, serif", fontSize: 12 }}>
        {Array.from({ length: ticks + 1 }, (_, i) => { const v = min + ((max - min) * i) / ticks; return (
          <g key={i}><line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} stroke={C.line} /><text x={PAD.l - 6} y={py(v) + 4} textAnchor="end" fill={C.muted}>{Math.round(v * 10) / 10}</text></g>
        ); })}
        {x.map((lab, i) => <text key={lab} x={px(i)} y={H - PAD.b + 18} textAnchor="middle" fill={C.muted}>{lab}</text>)}
        {yLabel && <text x={12} y={PAD.t - 6} fill={C.muted}>{yLabel}</text>}
        {series.map((s, k) => (
          <g key={s.name} fill={SERIES[k % SERIES.length]} stroke={SERIES[k % SERIES.length]}>
            <polyline fill="none" strokeWidth={2.5} points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(" ")} />
            {s.values.map((v, i) => <g key={i}>{mark(k, px(i), py(v))}</g>)}
          </g>
        ))}
        {series.map((s, k) => (
          <g key={`l-${s.name}`} transform={`translate(${PAD.l + k * 170}, ${H - 8})`} fill={SERIES[k % SERIES.length]} stroke={SERIES[k % SERIES.length]}>
            {mark(k, 6, 0)}<text x={16} y={4} stroke="none" fill={C.text}>{s.name}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
