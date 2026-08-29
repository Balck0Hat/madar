import { useState } from "react";
import { Play, Clock, Target } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { RING_NAMES, XP_LESSON, XP_QUIZ } from "../../../shared/data/curriculum";
import { unitInfo, isCenter } from "../../../shared/utils/units";
import { stats, nextUnit, eta } from "../../../shared/utils/progress";
import { levelFromXp, levelTitle } from "../../../shared/utils/level";
import { useNum } from "../../../shared/context/NumContext";
import { useTilt } from "../../../shared/hooks/useTilt";
import { Btn, Card, Pill } from "../../../shared/components/ui";
import Wheel from "../../../shared/components/wheel/Wheel";
import { polar, RADII, sectorMid } from "../../../shared/components/wheel/geometry";
import StatsRow from "./StatsRow";
import DomainGrid from "./DomainGrid";

export default function MapScreen({ profile, progress, xp, streak, weeklyXp, onOpenDomain, onOpenUnit, onProfile, threadsNew }) {
  const num = useNum();
  const level = levelFromXp(xp);
  const st = stats(progress);
  const next = nextUnit(progress, profile.fav);
  const info = next ? unitInfo(next) : null;
  const e = eta(progress, profile.minutes);
  const tilt = useTilt();
  const [zoom, setZoom] = useState(null);

  // تكبير نحو القطاع المختار قبل فتح صفحة المجال
  const select = (id, r, di) => {
    const [x, y] = polar((RADII[r][0] + RADII[r][1]) / 2, sectorMid(di));
    setZoom({ ox: ((x + 26) / 412) * 100, oy: ((y + 26) / 412) * 100 });
    setTimeout(() => onOpenDomain(id, r), 380);
  };
  const onCenter = () => (next && isCenter(next) ? onOpenUnit(next) : onProfile());

  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>مدار</div>
        <button type="button" onClick={onProfile} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px 6px 6px", display: "flex", alignItems: "center", gap: 8, color: C.text, cursor: "pointer" }}>
          <span style={{ width: 28, height: 28, borderRadius: 99, background: C.gold, color: "#141B33", display: "grid", placeItems: "center", fontWeight: 900 }}>{profile.name[0]}</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{profile.name}</span>
          <Pill>{levelTitle(level)}</Pill>
        </button>
      </div>
      <div style={{ padding: "6px 10px 0", touchAction: "manipulation" }} {...tilt}>
        <div style={{ transformOrigin: zoom ? `${zoom.ox}% ${zoom.oy}%` : "50% 50%", transform: zoom ? "scale(2.8)" : "none", opacity: zoom ? 0.15 : 1, transition: "transform .42s cubic-bezier(.4,0,.2,1), opacity .42s ease" }}>
          <Wheel progress={progress} level={level} recommended={next} onSelect={select} onCenter={onCenter} size="100%" threadsNew={threadsNew} />
        </div>
      </div>
      <StatsRow streak={streak} weeklyXp={weeklyXp} rank={st.rank} />
      <div style={{ padding: "14px 16px 0" }}>
        {info ? (
          <Card accent={info.color}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Pill color={info.color}>{info.domain ? `${info.domainName} · ${RING_NAMES[info.ring]}` : "المركز"}</Pill>
              <span style={{ color: C.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{num(info.minutes)} د · {num(XP_LESSON[info.ring] + XP_QUIZ[info.ring])} XP</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, margin: "10px 0 12px", lineHeight: 1.5 }}>{info.title}</div>
            <Btn primary onClick={() => onOpenUnit(next)}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Play size={16} />ابدأ الوحدة</span></Btn>
          </Card>
        ) : (
          <Card><div style={{ fontWeight: 800 }}>أنهيت المدار الأول</div><div style={{ color: C.muted, fontSize: 13 }}>المدار الثاني يُفتح الآن على العجلة.</div></Card>
        )}
        <div style={{ color: C.muted, fontSize: 12, marginTop: 10, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
          <Target size={12} /> بوتيرة {num(profile.minutes)} دقيقة يومياً تكمل المدار الأول في {e.label} ({num(e.days)} يوماً)
        </div>
      </div>
      <DomainGrid progress={progress} onOpenDomain={onOpenDomain} />
    </div>
  );
}
