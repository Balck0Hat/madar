import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { C, inputStyle, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { EmptyState } from "../../../shared/components/ui";
import DotMap from "../../../shared/components/ui/DotMap";
import CountryCard from "./CountryCard";

export const Chip = ({ on, color, count, children, onClick }) => (
  <button type="button" onClick={onClick} aria-pressed={on} className="madar-press"
    style={{ flexShrink: 0, minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, padding: `${S.md}px ${S.x2}px`, borderRadius: R.pill, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: S.md,
      background: on ? alpha(color || C.gold, 0.16) : C.surface, color: on ? (color || C.gold) : C.muted, border: `1px solid ${on ? (color || C.gold) : C.line}` }}>
    {color && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: R.pill, background: color }} />}
    {children}{count !== undefined && <span style={{ fontWeight: 400, opacity: 0.8 }}>{count}</span>}
  </button>
);

const hay = (c) => [c.name, c.officialName, c.englishName, c.capital, c.government?.headOfState?.name, c.government?.headOfGovernment?.name].filter(Boolean).join(" ").toLowerCase();

// الدول: خريطة نقاطها بلون نوع الحكم، وبحث بالاسم أو العاصمة أو اسم الحاكم،
// وفلتر بنوع الحكم (الأنواع التي لا دول تحتها لا تُعرض)، والبطاقات مجمّعة بالإقليم.
export default function CountriesTab({ countries, systems, colors, system, onSystem, onOpen }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = useMemo(() => countries.filter((c) => (!system || c.government.type === system) && (!needle || hay(c).includes(needle))), [countries, system, needle]);
  const groups = useMemo(() => {
    const out = [];
    for (const c of shown) { const g = out.find((x) => x.label === c.region); if (g) g.items.push(c); else out.push({ label: c.region, items: [c] }); }
    return out;
  }, [shown]);
  const points = shown.filter((c) => c.geo).map((c) => ({ id: c.countryId, lat: c.geo.lat, lon: c.geo.lon, label: c.name, color: colors[c.government.type] }));

  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `0 ${S.x2}px`, height: TAP + 4 }}>
        <Search size={16} color={C.muted} aria-hidden="true" />
        <input aria-label="ابحث عن دولة" value={q} onChange={(e) => setQ(e.target.value)} placeholder="دولة، أو عاصمة، أو اسم حاكم"
          style={{ ...inputStyle, background: "transparent", border: 0, padding: 0, height: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
        <Chip on={!system} onClick={() => onSystem("")}>كل الأنواع</Chip>
        {systems.filter((s) => s.ours > 0).map((s) => <Chip key={s.name} on={system === s.name} color={s.color} count={s.ours} onClick={() => onSystem(system === s.name ? "" : s.name)}>{s.name}</Chip>)}
      </div>
      <DotMap points={points} onOpen={onOpen} surface="app" label="خريطة الدول بلون نوع الحكم" />
      {!shown.length && <EmptyState title="لا نتائج" text="جرّب اسماً آخر أو أزل الفلترة." />}
      {groups.map((g) => (
        <section key={g.label} style={{ display: "grid", gap: S.lg }}>
          <h2 style={{ fontSize: T.sm, fontWeight: 700, color: C.muted, margin: `${S.md}px 0 0`, display: "flex", alignItems: "center", gap: S.lg }}>
            <span>{g.label}</span><span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
          </h2>
          {g.items.map((c) => <CountryCard key={c.countryId} country={c} color={colors[c.government.type]} onOpen={() => onOpen(c.countryId)} />)}
        </section>
      ))}
    </div>
  );
}
