import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useMedia } from "../../../shared/hooks/useMedia";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
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

  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x9 * 2 }}>
      <TopBar title="رحلتك في القواعد" onBack={onBack} right={
        <span style={{ display: "inline-flex", alignItems: "center", gap: S.lg }}>
          {journey && <span className="madar-num" aria-label={`أتقنت ${journey.pct}٪`} style={{ fontWeight: 700, color: C.gold, fontSize: T.lg }}>{num(journey.pct)}٪</span>}
          <Btn small full={false} paper onClick={onList}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><List size={14} aria-hidden="true" />قائمة</span></Btn>
        </span>
      } />
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
