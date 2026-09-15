import { P, MONO, READ, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { lifeLabel, TIER_LABEL } from "./figures.meta";
import { agoLabel } from "../utils/figureText";
import FigureImage from "./FigureImage";
import FigureTimeline from "./FigureTimeline";
import FigureMap from "./FigureMap";

// رأس الملف: الصورة، ثم الرقم البارز بجانب الاسم لا فوقه (كان يأخذ الشاشة
// الأولى كلها)، ثم السطر الذي يقرأه من لن يقرأ شيئاً آخر، ثم الزمن والمكان.
// الأنبياء بلا سنوات: «نحو 4 ق.م – رُفع» يُقرأ غريباً، والمكان يكفي.
export default function FigureHeader({ figure: f, list, color }) {
  const num = useNum();
  const prophet = f.tier === "prophet";
  const meta = [f.englishName, prophet ? "" : lifeLabel(f), f.region].filter(Boolean).join(" · ");
  return (
    <header>
      <FigureImage image={f.image} color={color} name={f.name} />
      <div style={{ color, fontSize: ".78em", fontWeight: 600 }}>{f.category} · {TIER_LABEL[f.tier] || ""}</div>
      <div style={{ display: "flex", alignItems: "center", gap: S.x3, margin: `${S.sm}px 0 ${S.xs}px` }}>
        <h1 style={{ fontSize: "1.6em", fontWeight: 700, margin: 0, lineHeight: 1.3, minWidth: 0, flex: 1 }}>{f.name}</h1>
        {f.hero?.num && (
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: "2.1em", fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{num(f.hero.num)}</div>
          </div>
        )}
      </div>
      {f.hero?.label && <div style={{ color: P.muted, fontSize: ".8em", lineHeight: 1.5 }}>{f.hero.label}</div>}
      <div style={{ fontFamily: MONO, color: P.muted, fontSize: ".82em", marginTop: S.md }}>{meta}</div>
      {!prophet && agoLabel(f) && <div style={{ color: P.muted, fontSize: ".82em", marginTop: S.xs }}>{num(agoLabel(f))}</div>}
      <p style={{ fontFamily: READ, fontSize: "1.12em", lineHeight: 1.9, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3, margin: `${S.x4}px 0 ${S.x2}px` }}>{f.why}</p>
      {!prophet && <FigureTimeline figure={f} list={list} color={color} />}
      <FigureMap geo={f.geo} color={color} />
    </header>
  );
}
