import { C, FONT, MONO } from "../../constants/theme";
import { DOMAINS } from "../../data/domains";
import { CENTER, THREADS } from "../../data/curriculum";
import { uid } from "../../utils/units";
import { stats } from "../../utils/progress";
import { useNum } from "../../context/NumContext";
import { polar, ring, starPos, RADII, SKY } from "./geometry";

function Ticks() {
  return Array.from({ length: 60 }).map((_, i) => {
    const a = i * 6, long = i % 6 === 0;
    const [x0, y0] = polar(long ? 158 : 161, a), [x1, y1] = polar(166, a);
    return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gold} strokeOpacity={long ? 0.7 : 0.28} strokeWidth={long ? 1.4 : 0.8} />;
  });
}

function Sector({ d, di, r, progress, locked, recommended, highlight, onSelect }) {
  const doneN = d.rings[r].filter((_, i) => progress[uid(d.id, r, i)]).length;
  const frac = doneN / 8;
  const [r0, r1] = RADII[r];
  const a0 = di * 36 + 1.3, a1 = (di + 1) * 36 - 1.3;
  const isRec = recommended && recommended.startsWith(d.id + "-") && r === 0;
  const isHi = highlight && highlight.di === di && highlight.r === r;
  const path = ring(r0, r1, a0, a1);
  return (
    <g onClick={() => onSelect && onSelect(d.id, r, di)} style={{ cursor: onSelect ? "pointer" : "default" }}>
      <path d={path} fill={d.color} fillOpacity={locked ? 0.07 : 0.12 + 0.78 * frac} stroke={C.bg} strokeWidth="1.5" />
      {(frac === 1 || isHi) && <path d={path} fill="none" stroke={isHi ? C.gold : d.color} strokeWidth="1.4" filter="url(#glow)" />}
      {isRec && <path className="madar-pulse" d={path} fill="none" stroke={C.gold} strokeWidth="2" />}
    </g>
  );
}

export default function WheelBody({ progress, level, recommended, onSelect, onCenter, compact = false, threadsNew = [], sky = true, animate = false, highlight }) {
  const s = stats(progress);
  const num = useNum();
  const centerFrac = CENTER.filter((_, i) => progress[`center-${i + 1}`]).length / CENTER.length;
  const doneThreads = THREADS.filter(([a, b]) => progress[a] && progress[b]);
  const ids = Object.keys(progress);
  const centerRec = recommended && recommended.startsWith("center");
  return (
    <g className={animate ? "madar-seg" : ""}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {sky && !compact && SKY.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={C.text} opacity={st.o} className={st.tw ? "madar-tw" : ""} style={{ animationDelay: `${st.delay}s` }} />)}
      <Ticks />
      <circle cx="180" cy="180" r="168" fill="none" stroke={C.gold} strokeOpacity="0.25" strokeWidth="0.8" />
      {DOMAINS.map((d, di) => d.rings.map((_, r) => (
        <Sector key={d.id + r} d={d} di={di} r={r} progress={progress} locked={r > 0 && !s.ring1Done} recommended={recommended} highlight={highlight} onSelect={onSelect} />
      )))}
      {doneThreads.map(([a, b]) => {
        const [ax, ay] = starPos(a), [bx, by] = starPos(b);
        const fresh = threadsNew.includes(a + b);
        return <path key={a + b} className={fresh ? "madar-draw" : ""} pathLength="1" d={`M${ax.toFixed(1)},${ay.toFixed(1)} Q180,180 ${bx.toFixed(1)},${by.toFixed(1)}`} fill="none" stroke={C.gold} strokeWidth="1.6" strokeOpacity="0.9" filter="url(#glow)" />;
      })}
      {ids.map((id, i) => {
        const [x, y] = starPos(id);
        return <circle key={id} cx={x} cy={y} r={2.2 + (i % 3) * 0.4} fill={C.gold} filter="url(#glow)" className={animate ? "madar-pop" : "madar-tw"} style={{ animationDelay: `${(i % 7) * 0.4}s`, transformOrigin: `${x}px ${y}px` }} />;
      })}
      {centerRec && <circle className="madar-pulse" cx="180" cy="180" r="43" fill="none" stroke={C.gold} strokeWidth="2" />}
      <g onClick={() => onCenter && onCenter()} style={{ cursor: onCenter ? "pointer" : "default" }}>
        <circle cx="180" cy="180" r="40" fill={C.surface} stroke={C.gold} strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="180" cy="180" r="40" fill="none" stroke={C.gold} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 40 * centerFrac} ${2 * Math.PI * 40}`} transform="rotate(-90 180 180)" strokeLinecap="round" />
        <text x="180" y="176" textAnchor="middle" fill={C.gold} fontFamily={MONO} fontSize="26" fontWeight="700">{num(level)}</text>
        <text x="180" y="194" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="10">المستوى</text>
      </g>
      {!compact && DOMAINS.map((d, di) => {
        const [x, y] = polar(180, di * 36 + 18);
        const active = recommended && recommended.startsWith(d.id + "-");
        return <text key={d.id} x={x} y={y + 4} textAnchor="middle" fill={active ? C.gold : C.muted} fontFamily={FONT} fontSize="11.5" fontWeight={active ? 700 : 400}>{d.name}</text>;
      })}
    </g>
  );
}
