import { Share2, Check } from "lucide-react";
import { P, MONO, READ, R, S, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import StatTiles from "../../../shared/components/ui/StatTiles";
import { lifeLabel, TIER_LABEL } from "./figures.meta";
import { agoLabel } from "../utils/figureText";
import FigureImage from "./FigureImage";
import FigureTimeline from "./FigureTimeline";
import FigureMap from "./FigureMap";

// رأس الملف بترتيب واحد لكل شخصية: الصورة، سطر الفئة، الاسم كبيراً، الاسم
// الإنجليزي، السنوات والمكان، ثم السطر الذي يقرأه من لن يقرأ شيئاً آخر، ثم
// الرقم البارز بطاقةً كأرقام الدروس (لا رقماً عملاقاً)، ثم الزمن والمكان.
// الأنبياء بلا سنوات وبلا شريط زمني: المكان يكفي.
export default function FigureHeader({ figure: f, list, color, onOpen, onShare, shared }) {
  const num = useNum();
  const prophet = f.tier === "prophet";
  const when = [prophet ? "" : lifeLabel(f), f.region].filter(Boolean).join(" · ");
  return (
    <header>
      <FigureImage image={f.image} color={color} name={f.name} />
      <div style={{ display: "flex", alignItems: "center", gap: S.lg }}>
        <div style={{ color, fontSize: ".78em", fontWeight: 700, flex: 1 }}>{f.category} · {TIER_LABEL[f.tier] || ""}</div>
        {onShare && (
          <button type="button" onClick={onShare} aria-label="مشاركة رابط الشخصية" className="madar-press"
            style={{ display: "inline-flex", alignItems: "center", gap: S.md, minHeight: TAP - S.xl, fontFamily: "inherit", fontSize: ".78em", fontWeight: 600, color: shared ? P.ink : P.muted, background: P.card, border: `1px solid ${P.line}`, borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px`, cursor: "pointer" }}>
            {shared ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}{shared ? "نُسخ الرابط" : "مشاركة"}
          </button>
        )}
      </div>
      <h1 style={{ fontSize: "1.9em", fontWeight: 700, margin: `${S.md}px 0 ${S.xs}px`, lineHeight: 1.25 }}>{f.name}</h1>
      <div style={{ fontFamily: MONO, color: P.muted, fontSize: ".78em", letterSpacing: ".01em" }}>{f.englishName}</div>
      {when && <div style={{ color: P.muted, fontSize: ".88em", marginTop: S.sm, lineHeight: 1.6 }}>{num(when)}</div>}
      {!prophet && agoLabel(f) && <div style={{ color: P.muted, fontSize: ".82em", marginTop: S.xs }}>{num(agoLabel(f))}</div>}
      <p style={{ fontFamily: READ, fontSize: "1.14em", lineHeight: 1.9, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3, margin: `${S.x5}px 0 ${S.x4}px` }}>{f.why}</p>
      {f.hero?.num && <StatTiles tiles={[{ v: f.hero.num, l: f.hero.label }]} color={color} />}
      {!prophet && <FigureTimeline figure={f} list={list} color={color} />}
      <FigureMap figure={f} list={list} color={color} onOpen={onOpen} />
      <div aria-hidden="true" style={{ height: 1, background: alpha(color, 0.25), margin: `${S.x5}px 0 0` }} />
    </header>
  );
}
