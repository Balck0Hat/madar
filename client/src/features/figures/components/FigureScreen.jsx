import { useState } from "react";
import { Clock } from "lucide-react";
import { P, MONO, READ, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import Prose from "../../../shared/components/ui/Prose";
import { getFigure } from "../services/figures.service";
import { colorOf, lifeLabel, TIER_LABEL } from "./figures.meta";

const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const minutes = (n) => Math.max(1, Math.round(n / 160));

// ملف شخصية: مستويان للقراءة يُبدَّل بينهما بلا إعادة تحميل، وشارة زمن القراءة تتبع المستوى.
// «القصة الكاملة» أقسام كبطاقات الوحدة، بالفقرات والاقتباسات نفسها.
export default function FigureScreen({ figureId, onBack }) {
  const num = useNum();
  const [depth, setDepth] = useState("quick");
  const { data: f, loading, error, reload } = useAsync(() => getFigure(figureId), [figureId]);
  const color = f ? colorOf(f.category) : P.gold;
  const storyWords = f ? f.story.reduce((n, s) => n + words(s.p), 0) : 0;
  const mins = depth === "quick" ? minutes(words(f?.quick)) : minutes(storyWords);

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(color, 0.07)}, transparent 60%)` }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>الشخصيات</span>} onBack={onBack} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={6} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  const Tab = ({ k, label, m }) => (
    <button type="button" role="tab" aria-selected={depth === k} onClick={() => setDepth(k)}
      style={{ flex: 1, minHeight: TAP, fontFamily: "inherit", fontWeight: 700, fontSize: T.md, borderRadius: R.lg, cursor: "pointer",
        background: depth === k ? alpha(color, 0.14) : P.card, color: depth === k ? color : P.muted, border: `1px solid ${depth === k ? color : P.line}` }}>
      {label} <span style={{ fontWeight: 400, fontSize: T.xs }}>· {num(m)} د</span>
    </button>
  );

  return shell(
    <>
      {f.hero?.num && (
        <div style={{ textAlign: "center", margin: `${S.x4}px 0 ${S.xl}px` }}>
          <div style={{ fontFamily: MONO, fontSize: "4.2em", fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{num(f.hero.num)}</div>
          <div style={{ color: P.muted, fontSize: ".88em", marginTop: S.md }}>{f.hero.label}</div>
        </div>
      )}
      <div style={{ color, fontSize: ".78em", fontWeight: 600 }}>{f.category} · {TIER_LABEL[f.tier] || ""}</div>
      <h1 style={{ fontSize: "1.6em", fontWeight: 700, margin: `${S.sm}px 0 ${S.xs}px`, lineHeight: 1.3 }}>{f.name}</h1>
      <div style={{ fontFamily: MONO, color: P.muted, fontSize: ".82em" }}>{f.englishName} · {lifeLabel(f)}{f.region ? ` · ${f.region}` : ""}</div>
      <div style={{ ...body, fontSize: "1.02em", borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3, margin: `${S.x3}px 0` }}>{f.why}</div>

      <div role="tablist" style={{ display: "flex", gap: S.lg, margin: `${S.x2}px 0 ${S.x3}px` }}>
        <Tab k="quick" label="ملخص سريع" m={minutes(words(f.quick))} />
        <Tab k="story" label="القصة الكاملة" m={minutes(storyWords)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: S.md, color: P.muted, fontSize: ".8em", marginBottom: S.x2 }}>
        <Clock size={13} aria-hidden="true" />نحو {num(mins)} دقائق قراءة
      </div>

      {depth === "quick" ? (
        <div key="quick" className="madar-in" style={body}><Prose text={f.quick} /></div>
      ) : (
        <div key="story" className="madar-in" style={{ display: "grid", gap: S.x5 }}>
          {f.story.map((s, i) => (
            <section key={i}>
              <div style={{ color, fontSize: ".75em", fontWeight: 600 }}>{num(i + 1)}</div>
              <h2 style={{ fontSize: "1.3em", fontWeight: 700, margin: `${S.sm}px 0 ${S.xl}px`, lineHeight: 1.4 }}>{s.h}</h2>
              <div style={body}><Prose text={s.p} /></div>
            </section>
          ))}
          {f.sources?.length > 0 && (
            <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: S.x2, color: P.muted, fontSize: ".8em", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: S.sm }}>للاستزادة</div>
              {f.sources.map((s, i) => <div key={i}>· {s}</div>)}
            </div>
          )}
        </div>
      )}
    </>,
  );
}
