import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { C, inputStyle, T, R, S, TAP } from "../../../shared/constants/theme";
import { EmptyState } from "../../../shared/components/ui";
import { Chip } from "./CountriesTab";
import TitleCard from "./TitleCard";

const hay = (t) => [t.name, t.original, t.meaning, ...(t.holders || [])].join(" ").toLowerCase();

// الألقاب: عائلات (سيادة وراثية، نبالة أوروبية، مراتب شرقية، مناصب جمهورية…)
// وتحت كل عائلة ألقابها بطاقات تُفتح. البحث بالاسم العربي أو الأصلي أو بمن حمله.
export default function TitlesTab({ families = [] }) {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () => families
      .filter((f) => !family || f.familyId === family)
      .map((f) => ({ ...f, titles: f.titles.filter((t) => !needle || hay(t).includes(needle)) }))
      .filter((f) => f.titles.length),
    [families, family, needle],
  );

  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `0 ${S.x2}px`, height: TAP + 4 }}>
        <Search size={16} color={C.muted} aria-hidden="true" />
        <input aria-label="ابحث عن لقب" value={q} onChange={(e) => setQ(e.target.value)} placeholder="لقب، أو كلمته الأصلية، أو من حمله"
          style={{ ...inputStyle, background: "transparent", border: 0, padding: 0, height: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
        <Chip on={!family} onClick={() => setFamily("")}>كل العائلات</Chip>
        {families.map((f) => <Chip key={f.familyId} on={family === f.familyId} count={f.titles.length} onClick={() => setFamily(family === f.familyId ? "" : f.familyId)}>{f.family}</Chip>)}
      </div>
      {!shown.length && <EmptyState title="لا نتائج" text="جرّب كلمة أخرى أو أزل الفلترة." />}
      {shown.map((f) => (
        <section key={f.familyId} style={{ display: "grid", gap: S.lg }}>
          <h2 style={{ fontSize: T.lg, fontWeight: 700, margin: `${S.lg}px 0 0` }}>{f.family}</h2>
          {f.intro && <p style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, margin: 0 }}>{f.intro}</p>}
          {f.titles.map((t) => <TitleCard key={t.titleId} title={t} open={Boolean(needle) && f.titles.length === 1} />)}
        </section>
      ))}
    </div>
  );
}
