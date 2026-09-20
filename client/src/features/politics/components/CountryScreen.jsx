import { P, MONO, READ, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import Prose from "../../../shared/components/ui/Prose";
import CheckIn from "../../../shared/components/ui/CheckIn";
import DotMap from "../../../shared/components/ui/DotMap";
import { getCountry, listCountries, getOverview } from "../services/politics.service";
import GovernmentPanel from "./GovernmentPanel";
import Flag from "./Flag";

const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// ثلاث حقائق في صف: القيم نصوص («نحو 46 مليون»، «438,317 كم²») أطول من أن
// تُرسم بخط بطاقات الأرقام، فلها خط أصغر لا ينكسر.
const Facts = ({ items, color }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: S.lg, margin: `0 0 ${S.x4}px` }}>
    {items.map((it) => (
      <div key={it.l} style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x2, padding: `${S.x2}px ${S.lg}px`, textAlign: "center", minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "1em", color, lineHeight: 1.4, overflowWrap: "anywhere" }}>{it.v}</div>
        <div style={{ color: P.muted, fontSize: ".75em", marginTop: S.xs, lineHeight: 1.4 }}>{it.l}</div>
      </div>
    ))}
  </div>
);

// ملف دولة بالترتيب نفسه لكل دولة: العلم والاسم، ثلاثة أرقام، سطر «لماذا تهم»،
// ثم «كيف تُحكم» (قلب الصفحة)، ثم الخريطة، فالملخص، فأربعة أقسام قصيرة،
// فسؤال اختياري ومصادر، فالدولة التالية.
export default function CountryScreen({ countryId, onBack, onOpen }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([getCountry(countryId), listCountries().catch(() => []), getOverview().catch(() => ({ systems: [] }))]).then(([country, list, overview]) => ({ country, list, overview })),
    [countryId],
  );
  const c = data?.country;
  const colors = Object.fromEntries((data?.overview.systems || []).map((s) => [s.name, s.color]));
  const color = (c && colors[c.government?.type]) || P.gold;

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.ink, "--unit-color": color, backgroundImage: `radial-gradient(140% 60% at 50% 0%, ${alpha(color, 0.07)}, transparent 60%)` }}>
      <TopBar paper title={<span style={{ fontSize: T.lg }}>الدول</span>} onBack={onBack} />
      <div className="madar-read" style={{ padding: `${S.lg}px ${S.x5}px ${S.x8}px` }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton paper lines={6} />);
  if (error || !c) return shell(<ErrorState message={error?.message || "الدولة غير متاحة"} onRetry={reload} onBack={onBack} />);

  const list = data.list;
  const at = list.findIndex((o) => o.countryId === c.countryId);
  const next = at >= 0 ? list[at + 1] : null;
  const points = (list.length ? list : [c]).filter((o) => o.geo).map((o) => ({ id: o.countryId, lat: o.geo.lat, lon: o.geo.lon, label: o.countryId === c.countryId ? c.capital : o.name, color: o.countryId === c.countryId ? color : undefined, active: o.countryId === c.countryId }));
  const check = c.check ? { t: "mcq", ...c.check } : null;

  return shell(
    <>
      <header>
        <div style={{ display: "flex", alignItems: "center", gap: S.x3 }}>
          <Flag country={c} width={72} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color, fontSize: ".78em", fontWeight: 700 }}>{c.region} · {c.continent}</div>
            <h1 style={{ fontSize: "1.9em", fontWeight: 700, margin: `${S.xs}px 0 0`, lineHeight: 1.25 }}>{c.name}</h1>
          </div>
        </div>
        <div style={{ color: P.muted, fontSize: ".9em", marginTop: S.md, lineHeight: 1.6 }}>{c.officialName}</div>
        <div style={{ fontFamily: MONO, color: P.muted, fontSize: ".78em" }}>{c.englishName}</div>
        <div style={{ color: P.muted, fontSize: ".88em", marginTop: S.sm, lineHeight: 1.7 }}>العاصمة: {c.capital} · العملة: {c.currency} · اللغة: {(c.languages || []).join("، ")}</div>
        <p style={{ fontFamily: READ, fontSize: "1.14em", lineHeight: 1.9, borderInlineStart: `3px solid ${color}`, paddingInlineStart: S.x3, margin: `${S.x5}px 0 ${S.x4}px` }}>{c.why}</p>
        <Facts items={[{ v: num(c.population), l: "السكان" }, { v: num(c.area), l: "المساحة" }, { v: num(c.independence), l: "الاستقلال أو التأسيس" }]} color={color} />
      </header>
      <GovernmentPanel government={c.government} color={color} asOf={c.asOf} />
      <div style={{ marginTop: S.x4 }}><DotMap points={points} onOpen={onOpen} tint={color} label={`موقع ${c.name} على الخريطة`} /></div>
      <div style={{ ...body, marginTop: S.x5 }}><Prose text={c.quick} mono /></div>
      <div style={{ display: "grid", gap: S.x5, marginTop: S.x6 }}>
        {(c.story || []).map((s, i) => (
          <section key={s.h}>
            <div style={{ color, fontSize: ".75em", fontWeight: 600 }}>القسم {num(i + 1)} من {num(c.story.length)}</div>
            <h2 style={{ fontSize: "1.42em", fontWeight: 700, margin: `${S.sm}px 0 ${S.x2}px`, lineHeight: 1.4 }}>{s.h}</h2>
            <div style={body}><Prose text={s.p} mono /></div>
          </section>
        ))}
      </div>
      <CheckIn question={check} color={color} />
      {c.sources?.length > 0 && (
        <div style={{ borderTop: `1px solid ${P.line}`, marginTop: S.x5, paddingTop: S.x2, color: P.muted, fontSize: ".8em", lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, marginBottom: S.sm }}>للاستزادة</div>
          {c.sources.map((s, i) => <div key={i}>· {s}</div>)}
        </div>
      )}
      {next && (
        <button type="button" onClick={() => onOpen?.(next.countryId)} className="madar-press"
          style={{ display: "flex", alignItems: "center", gap: S.x2, width: "100%", minHeight: TAP, marginTop: S.x5, textAlign: "start", fontFamily: "inherit", cursor: "pointer", color: P.ink, background: alpha(color, 0.1), border: `1px solid ${color}`, borderRadius: R.x2, padding: `${S.x2}px ${S.x3}px` }}>
          <Flag country={next} width={36} />
          <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", color: P.muted, fontSize: ".78em" }}>التالي</span><span style={{ fontWeight: 700 }}>{next.name}</span></span>
        </button>
      )}
    </>,
  );
}
