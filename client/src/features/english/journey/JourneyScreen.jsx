import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List, ArrowRight } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useMedia } from "../../../shared/hooks/useMedia";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { useNum } from "../../../shared/context/PrefsContext";
import { Skeleton, ErrorState } from "../../../shared/components/ui";
import { getWorld } from "../services/english.service";
import { ensureWorldStyles } from "../world/worldStyles";
import { WORLD, buildJourney, nextStep } from "./journeyStages";
import JourneyWorld from "./JourneyWorld";
import StageSheet from "./StageSheet";
import ContinueBar from "./ContinueBar";

// رحلة القواعد: عالم واحد من الأسفل إلى القمة بسبع محطات. تُفتح الصفحة على المحطة الحالية،
// والنقر على محطة يركّز عليها ثم يفتح ورقتها؛ «استكشف المحطة» يدخل خريطتها التفصيلية بالدروس.
export default function JourneyScreen({ onBack, onLesson, onBoss, onStage, onList }) {
  const num = useNum();
  const wide = useMedia("(min-width: 1100px)");
  const reduced = useReducedMotion();
  const { data: world, loading, error, reload } = useAsync(() => getWorld(), []);
  const journey = useMemo(() => (world ? buildJourney(world) : null), [world]);
  const [sel, setSel] = useState(null);
  const [away, setAway] = useState(false);
  const refs = useRef({});
  useEffect(() => { ensureWorldStyles(); }, []);
  const currentId = journey?.stages[journey.current]?.id;

  // افتح على المحطة الحالية: في منتصف الشاشة السفلي، لا من المحطة الأولى دائماً
  useEffect(() => {
    const el = currentId && refs.current[currentId];
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: Math.max(0, window.scrollY + r.top + r.height / 2 - window.innerHeight * 0.58), behavior: "auto" });
  }, [currentId]);
  // حين تغيب المحطة الحالية عن الشاشة يتقلّص «تابع» إلى «عُد إلى موقعي»
  useEffect(() => {
    const el = currentId && refs.current[currentId];
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setAway(!e.isIntersecting), { rootMargin: "-10% 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [currentId]);

  const focusStage = useCallback((stage) => { refs.current[stage.id]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); setSel(stage.id); }, [reduced]);
  const close = useCallback(() => setSel(null), []);

  // رأس مضغوط جداً: رجوع، العنوان، شريط تقدّم رفيع ونسبته، وزر القائمة؛ العالم هو البطل
  const iconBtn = { width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.text, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x9 * 2 }}>
      <header style={{ display: "flex", alignItems: "center", gap: S.lg, padding: `${S.lg}px ${S.x3}px` }}>
        <button type="button" onClick={onBack} aria-label="رجوع" style={iconBtn}><ArrowRight size={18} /></button>
        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: S.xs }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: S.md }}>
            <h1 style={{ margin: 0, fontSize: T.lg, fontWeight: 700 }}>رحلتك في القواعد</h1>
            {journey && <span className="madar-num" style={{ color: C.gold, fontWeight: 700, fontSize: T.sm }}>{num(journey.pct)}٪</span>}
          </div>
          {journey && <div role="progressbar" aria-label="تقدّم الرحلة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={journey.pct} style={{ height: S.sm, borderRadius: R.pill, background: C.line, overflow: "hidden" }}><div style={{ width: `${journey.pct}%`, height: "100%", background: C.gold, borderRadius: R.pill }} /></div>}
        </div>
        <button type="button" onClick={onList} aria-label="قائمة الدروس" style={iconBtn}><List size={18} /></button>
      </header>
      {children}
    </div>
  );
  if (loading) return shell(<div style={{ padding: `0 ${S.x4}px` }}><Skeleton lines={10} /></div>);
  if (error) return shell(<div style={{ padding: `0 ${S.x4}px` }}><ErrorState message={error.message} onRetry={reload} onBack={onBack} /></div>);

  const step = nextStep(journey, world.quest);
  const selected = journey.stages.find((s) => s.id === sel);
  const go = (st) => (st?.kind === "lesson" ? onLesson(st.node.tag) : st?.kind === "boss" ? onBoss(st.stage.id) : null);
  return shell(
    <>
      <div style={{ position: "relative", overflow: "hidden", background: `url(${WORLD.src}) center / cover`, borderRadius: R.x3 }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backdropFilter: "blur(22px) brightness(.7)", background: alpha(C.bg, 0.25) }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <JourneyWorld journey={journey} selected={sel} onSelect={focusStage} refs={refs} />
        </div>
      </div>
      {selected && <StageSheet stage={selected} prev={journey.stages[selected.index - 1]} desktop={wide} onClose={close} onContinue={() => go(step)} onExplore={onStage} />}
      {!selected && <ContinueBar step={step} away={away} onContinue={() => go(step)} onHome={() => focusStage(journey.stages[journey.current])} />}
    </>,
  );
}
