import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { C, inputStyle, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { useDebounced } from "../hooks/useDebounced";
import { listFigures } from "../services/figures.service";
import { groupByPeriod } from "../utils/figureText";
import { readSet } from "../utils/figureStore";
import { ERAS, CATEGORIES, colorOf } from "./figures.meta";
import FigureCard from "./FigureCard";

const Chip = ({ on, color, children, onClick }) => (
  <button type="button" onClick={onClick} aria-pressed={on} className="madar-press"
    style={{ flexShrink: 0, minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, padding: `${S.md}px ${S.x2}px`, borderRadius: R.pill, cursor: "pointer",
      background: on ? alpha(color || C.gold, 0.16) : C.surface, color: on ? (color || C.gold) : C.muted, border: `1px solid ${on ? (color || C.gold) : C.line}` }}>
    {children}
  </button>
);

// قائمة الشخصيات: بحث بالاسم، وفلترة بالعصر والمجال، من غير إعادة تحميل.
// البطاقات مجمّعة بحقبتها («الألفية الثانية قبل الميلاد»، «القرن السادس…»)
// لأن عشرين بطاقة متشابهة بلا فواصل لا تُقرأ، ومن قُرئ يحمل شارة.
export default function FiguresScreen({ onBack, onOpen }) {
  const [q, setQ] = useState("");
  const [era, setEra] = useState("");
  const [category, setCategory] = useState("");
  const dq = useDebounced(q.trim());
  const { data, loading, error, reload } = useAsync(() => listFigures({ q: dq, era, category }), [dq, era, category]);
  const figures = useMemo(() => data || [], [data]);
  const groups = useMemo(() => groupByPeriod(figures), [figures]);
  const read = useMemo(() => readSet(), [figures]);

  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="الشخصيات" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `0 ${S.x2}px`, height: TAP + 4 }}>
          <Search size={16} color={C.muted} aria-hidden="true" />
          <input aria-label="ابحث عن شخصية" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم بالعربية أو الإنجليزية"
            style={{ ...inputStyle, background: "transparent", border: 0, padding: 0, height: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
          <Chip on={!era} onClick={() => setEra("")}>كل العصور</Chip>
          {ERAS.map((e) => <Chip key={e} on={era === e} onClick={() => setEra(era === e ? "" : e)}>{e}</Chip>)}
        </div>
        <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
          <Chip on={!category} onClick={() => setCategory("")}>كل المجالات</Chip>
          {CATEGORIES.map((c) => <Chip key={c} on={category === c} color={colorOf(c)} onClick={() => setCategory(category === c ? "" : c)}>{c}</Chip>)}
        </div>
        {loading && <Skeleton lines={5} />}
        {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
        {data && !figures.length && <EmptyState title="لا نتائج" text="جرّب اسماً آخر أو أزل الفلترة." />}
        {figures.length > 0 && (
          <div style={{ color: C.muted, fontSize: T.xs }}>{figures.length} شخصية · قرأت {read.size}</div>
        )}
        {groups.map((g) => (
          <section key={g.label} style={{ display: "grid", gap: S.lg }}>
            <h2 style={{ fontSize: T.sm, fontWeight: 700, color: C.muted, margin: `${S.md}px 0 0`, display: "flex", alignItems: "center", gap: S.lg }}>
              <span>{g.label}</span><span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
            </h2>
            {g.items.map((f) => <FigureCard key={f.figureId} figure={f} read={read.has(f.figureId)} onOpen={() => onOpen(f.figureId)} />)}
          </section>
        ))}
      </div>
    </div>
  );
}
