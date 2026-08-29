import { useId, useMemo, useRef, useState } from "react";
import { C, FONT, MONO } from "../../constants/theme";
import { DOMAINS } from "../../data/domains";
import { CENTER, THREADS, RING_NAMES } from "../../data/curriculum";
import { ringUnlocked } from "../../utils/progress";
import { useNum } from "../../context/NumContext";
import { usePrefs } from "../../context/PrefsContext";
import { polar, starPos, SKY } from "./geometry";
import { wheelUnits, sectorDone, sameCue } from "./wheelUnits";
import { useWheelNav } from "./useWheelNav";
import Sector from "./Sector";
import UnitDots from "./UnitDots";
import WheelHits from "./WheelHits";
import { FocusRing, Cue } from "./WheelCue";

function Ticks({ p }) {
  return Array.from({ length: 60 }).map((_, i) => {
    const a = i * 6, long = i % 6 === 0;
    const [x0, y0] = polar(long ? 158 : 161, a), [x1, y1] = polar(166, a);
    return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={p.gold} strokeOpacity={long ? 0.7 : 0.28} strokeWidth={long ? 1.4 : 0.8} />;
  });
}

// palette: متغيرات CSS افتراضياً؛ تُمرَّر ألوان حرفية عند التصدير كصورة PNG.
// طبقتا الوحدات واللمس تظهران فقط حين تكون العجلة تفاعلية (onSelect/onSelectUnit)،
// فتبقى بطاقة المشاركة وشاشة النتيجة كما هما بالضبط.
export default function WheelBody({ progress, level, recommended, onSelect, onSelectUnit, onCenter, compact = false, threadsNew = [], sky = true, animate = false, highlight, palette: p = C }) {
  const num = useNum();
  const { arabicNums } = usePrefs();
  const prefix = useId();
  const [hover, setHover] = useState(null);
  const interactive = Boolean(onSelect || onSelectUnit);
  const units = useMemo(() => wheelUnits(progress), [progress]);
  const done = useMemo(() => sectorDone(units), [units]);
  const nav = useWheelNav({ units, prefix, enabled: interactive, onSelect, onSelectUnit });

  // المُعالِجات تُقرأ من مرجع حيّ كي تبقى ثابتة الهوية فتصمد ذاكرةُ الطبقات
  // أمام إعادة التصيير المتكررة (الميل ثلاثي الأبعاد في شاشة الخريطة يعيدها كل إطار)
  const live = useRef(null);
  live.current = { onSelect, onSelectUnit };
  const on = useMemo(() => ({
    sector: (di, r) => live.current.onSelect && live.current.onSelect(DOMAINS[di].id, r, di),
    unit: (id) => live.current.onSelectUnit && live.current.onSelectUnit(id),
    over: (cue) => setHover(cue),
    out: (cue) => setHover((h) => (sameCue(h, cue) ? null : h)),
  }), []);

  // num يتبع arabicNums وحدها، فهي كافية في قائمة التبعيات رغم تجدّد هويته
  const label = useMemo(() => ({
    sector: (di, r) => `${DOMAINS[di].name} · ${RING_NAMES[r]} · ${num(done[`${di}-${r}`] || 0)}/${num(8)}`,
  }), [done, arabicNums]); // eslint-disable-line react-hooks/exhaustive-deps

  const dots = useMemo(() => (interactive ? <UnitDots units={units} recommended={recommended} p={p} /> : null), [interactive, units, recommended, p]);
  const hits = useMemo(() => (interactive ? <WheelHits units={units} prefix={prefix} label={label} on={on} /> : null), [interactive, units, prefix, label, on]);

  const cue = nav.cue || hover;
  const cueText = !cue ? null : cue.kind === "unit" ? (units.find((u) => u.id === cue.id) || {}).title : label.sector(cue.di, cue.r);
  const centerFrac = CENTER.filter((_, i) => progress[`center-${i + 1}`]).length / CENTER.length;
  const doneThreads = THREADS.filter(([a, b]) => progress[a] && progress[b]);
  const ids = Object.keys(progress);
  const centerRec = recommended && recommended.startsWith("center");
  return (
    <g className={animate ? "madar-seg" : ""}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {sky && !compact && SKY.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={p.text} opacity={st.o} className={st.tw ? "madar-tw" : ""} style={{ animationDelay: `${st.delay}s` }} />)}
      <Ticks p={p} />
      <circle cx="180" cy="180" r="168" fill="none" stroke={p.gold} strokeOpacity="0.25" strokeWidth="0.8" />
      {DOMAINS.map((d, di) => d.rings.map((_, r) => (
        <Sector key={d.id + r} d={d} di={di} r={r} progress={progress} locked={!ringUnlocked(progress, d.id, r)}
          recommended={recommended} highlight={highlight} hot={sameCue(cue, { kind: "sector", di, r })} smooth={interactive && !animate} p={p} />
      )))}
      {doneThreads.map(([a, b]) => {
        const [ax, ay] = starPos(a), [bx, by] = starPos(b);
        const fresh = threadsNew.includes(a + b);
        return <path key={a + b} className={fresh ? "madar-draw" : ""} pathLength="1" d={`M${ax.toFixed(1)},${ay.toFixed(1)} Q180,180 ${bx.toFixed(1)},${by.toFixed(1)}`} fill="none" stroke={p.gold} strokeWidth="1.6" strokeOpacity="0.9" filter="url(#glow)" />;
      })}
      {dots}
      {ids.map((id, i) => {
        const [x, y] = starPos(id);
        return <circle key={id} cx={x} cy={y} r={2.2 + (i % 3) * 0.4} fill={p.gold} filter="url(#glow)" className={animate ? "madar-pop" : "madar-tw"} style={{ animationDelay: `${(i % 7) * 0.4}s`, transformOrigin: `${x}px ${y}px` }} />;
      })}
      {centerRec && <circle className="madar-pulse" cx="180" cy="180" r="43" fill="none" stroke={p.gold} strokeWidth="2" />}
      <g onClick={() => onCenter && onCenter()} style={{ cursor: onCenter ? "pointer" : "default" }}>
        <circle cx="180" cy="180" r="40" fill={p.surface} stroke={p.gold} strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="180" cy="180" r="40" fill="none" stroke={p.gold} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 40 * centerFrac} ${2 * Math.PI * 40}`} transform="rotate(-90 180 180)" strokeLinecap="round" />
        <text x="180" y="176" textAnchor="middle" fill={p.gold} fontFamily={MONO} fontSize="26" fontWeight="700">{num(level)}</text>
        <text x="180" y="194" textAnchor="middle" fill={p.muted} fontFamily={FONT} fontSize="10">المستوى</text>
      </g>
      {!compact && DOMAINS.map((d, di) => {
        const [x, y] = polar(180, di * 36 + 18);
        const active = recommended && recommended.startsWith(d.id + "-");
        return <text key={d.id} x={x} y={y + 4} textAnchor="middle" fill={active ? p.gold : p.muted} fontFamily={FONT} fontSize="11.5" fontWeight={active ? 700 : 400}>{d.name}</text>;
      })}
      {nav.props ? <g {...nav.props}>{hits}</g> : hits}
      <FocusRing cue={nav.cue} units={units} p={p} />
      <Cue text={cueText} p={p} />
    </g>
  );
}
