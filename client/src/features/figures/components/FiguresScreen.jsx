import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { C, inputStyle, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { useDebounced } from "../hooks/useDebounced";
import { useFigureProgress } from "../hooks/useFigureProgress";
import { listFigures } from "../services/figures.service";
import { groupByPeriod, countBy } from "../utils/figureText";
import { ERAS, CATEGORIES, colorOf } from "./figures.meta";
import FigureCard from "./FigureCard";

const Chip = ({ on, color, count, children, onClick }) => (
  <button type="button" onClick={onClick} aria-pressed={on} className="madar-press"
    style={{ flexShrink: 0, minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, padding: `${S.md}px ${S.x2}px`, borderRadius: R.pill, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: S.md,
      background: on ? alpha(color || C.gold, 0.16) : C.surface, color: on ? (color || C.gold) : C.muted, border: `1px solid ${on ? (color || C.gold) : C.line}` }}>
    {color && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: R.pill, background: color }} />}
    {children}{count !== undefined && <span style={{ fontWeight: 400, opacity: 0.8 }}>{count}</span>}
  </button>
);

// قائمة الشخصيات. الفلترة بالعصر والمجال على الجهاز (القائمة صغيرة وتُجلب
// مرة)، والبحث في الخادم لأنه يفتّش داخل القصص. الفلتر الذي لا شخصيات تحته
// لا يُعرض، فلا تبقى صفوف من الأزرار الميتة. البطاقات مجمّعة بحقبتها.
export default function FiguresScreen({ onBack, onOpen }) {
  const [q, setQ] = useState("");
  const [era, setEra] = useState("");
  const [category, setCategory] = useState("");
  const dq = useDebounced(q.trim());
  const all = useAsync(() => listFigures(), []);
  const hits = useAsync(() => (dq ? listFigures({ q: dq }) : Promise.resolve(null)), [dq]);
  const { read } = useFigureProgress();

  const base = useMemo(() => (dq && hits.data) || all.data || [], [dq, hits.data, all.data]);
  const figures = useMemo(() => base.filter((f) => (!era || f.era === era) && (!category || f.category === category)), [base, era, category]);
  const groups = useMemo(() => groupByPeriod(figures), [figures]);
  const eras = useMemo(() => countBy(all.data || [], "era"), [all.data]);
  const cats = useMemo(() => countBy(all.data || [], "category"), [all.data]);
  const loading = all.loading || (dq && hits.loading);
  const error = all.error || hits.error;

  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="الشخصيات" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `0 ${S.x2}px`, height: TAP + 4 }}>
          <Search size={16} color={C.muted} aria-hidden="true" />
          <input aria-label="ابحث عن شخصية" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم، أو كلمة من قصته: بهستون، الكعبة، الطاو"
            style={{ ...inputStyle, background: "transparent", border: 0, padding: 0, height: "100%" }} />
        </div>
        {eras.size > 1 && (
          <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
            <Chip on={!era} onClick={() => setEra("")}>كل العصور</Chip>
            {ERAS.filter((e) => eras.has(e)).map((e) => <Chip key={e} on={era === e} count={eras.get(e)} onClick={() => setEra(era === e ? "" : e)}>{e}</Chip>)}
          </div>
        )}
        <div style={{ display: "flex", gap: S.md, overflowX: "auto", paddingBottom: S.xs }}>
          <Chip on={!category} onClick={() => setCategory("")}>كل المجالات</Chip>
          {CATEGORIES.filter((c) => cats.has(c)).map((c) => <Chip key={c} on={category === c} color={colorOf(c)} count={cats.get(c)} onClick={() => setCategory(category === c ? "" : c)}>{c}</Chip>)}
        </div>
        {loading && <Skeleton lines={5} />}
        {error && <ErrorState message={error.message} onRetry={() => { all.reload(); hits.reload(); }} onBack={onBack} />}
        {!loading && !error && !figures.length && <EmptyState title="لا نتائج" text="جرّب اسماً آخر أو أزل الفلترة." />}
        {figures.length > 0 && <div style={{ color: C.muted, fontSize: T.xs }}>{figures.length} شخصية · قرأت {read.size}</div>}
        {!loading && groups.map((g) => (
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
