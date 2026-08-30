import { useState } from "react";
import { C, T, R } from "../../../shared/constants/theme";
import { unitInfo, isCenter } from "../../../shared/utils/units";
import { nextUnit, eta } from "../../../shared/utils/progress";
import { levelFromXp, levelTitle } from "../../../shared/utils/level";
import { useTilt } from "../../../shared/hooks/useTilt";
import { Pill } from "../../../shared/components/ui";
import Wheel from "../../../shared/components/wheel/Wheel";
import { polar, RADII, sectorMid } from "../../../shared/components/wheel/geometry";
import { resumeUnit } from "../utils/resume";
import PrimaryCard from "./PrimaryCard";
import TodayStrip from "./TodayStrip";
import DomainGrid from "./DomainGrid";

// الشاشة الأولى تحمل فعلاً واحداً: العجلة (خريطة المعرفة) ثم بطاقة واحدة تقول
// «تابع القراءة» أو «ابدأ الوحدة». كل ما عداها مطويّ في شريط «اليوم».
export default function MapScreen({
  profile, progress, xp, streak, freezes = 0, weeklyXp, reviewDue = 0, resume = {},
  calm: calmProp, onOpenDomain, onOpenUnit, onProfile, onReview, onToast, threadsNew,
}) {
  const level = levelFromXp(xp);
  const next = nextUnit(progress, profile.fav);
  // وضع الهدوء يصل مع الملف الشخصي، ونقبل تجاوزه كخاصية صريحة للاختبار والتركيب
  const calm = calmProp ?? Boolean(profile.calm);
  // ما بدأه ولم يُنهه يسبق ما لم يبدأه: العودة إلى صفحة مفتوحة أقلّ كلفة من بداية جديدة
  const started = resumeUnit(resume, progress, next);
  const target = started || next;
  const info = target ? unitInfo(target) : null;
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
      {/* madar-wide: عمودان فوق 900px، و display:contents تحتها — فنفس الـJSX يعطي العمود الواحد على الهاتف بلا تغيير في الترتيب */}
      <div className="madar-wide">
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 0" }}>
            <div style={{ fontSize: T.x4, fontWeight: 900 }}>مدار</div>
            <button type="button" className="madar-press" onClick={onProfile} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: "6px 12px 6px 6px", display: "flex", alignItems: "center", gap: 8, color: C.text, cursor: "pointer" }}>
              <span style={{ width: 28, height: 28, borderRadius: R.pill, background: C.gold, color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 900 }}>{profile.name[0]}</span>
              <span style={{ fontSize: T.base, fontWeight: 700 }}>{profile.name}</span>
              <Pill>{levelTitle(level)}</Pill>
            </button>
          </div>
          {/* العجلة size="100%" فنحدّ حاضنتها بـ520px ونتوسّطها كي لا تتضخّم على سطح المكتب؛ على الهاتف العرض أقل فلا أثر للحد */}
          <div style={{ padding: "6px 10px 0", touchAction: "manipulation", maxWidth: 520, marginInline: "auto" }} {...tilt}>
            <div style={{ transformOrigin: zoom ? `${zoom.ox}% ${zoom.oy}%` : "50% 50%", transform: zoom ? "scale(2.8)" : "none", opacity: zoom ? 0.15 : 1, transition: "transform .42s cubic-bezier(.4,0,.2,1), opacity .42s ease" }}>
              <Wheel progress={progress} level={level} recommended={next} onSelect={select} onSelectUnit={onOpenUnit} onCenter={onCenter} size="100%" threadsNew={threadsNew} />
            </div>
          </div>
        </div>
        <div>
          <div style={{ padding: "14px 16px 0", display: "grid", gap: 10 }}>
            <PrimaryCard info={info} resuming={Boolean(started)} minutes={profile.minutes} eta={info ? e : null} onOpen={() => onOpenUnit(target)} />
            <TodayStrip streak={streak} weeklyXp={weeklyXp} freezes={freezes} reviewDue={reviewDue} calm={calm} onReview={onReview} onToast={onToast} />
          </div>
          <DomainGrid progress={progress} onOpenDomain={onOpenDomain} />
        </div>
      </div>
    </div>
  );
}
