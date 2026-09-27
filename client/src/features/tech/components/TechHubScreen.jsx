import { useMemo, useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getTechTree } from "../services/tech.service";
import TechSearch from "./TechSearch";
import { metaOf, LEVELS, levelTone, LEVEL_LABEL } from "./tech.meta";

// بوابة التقنية: بحث وتصفية، ثم ثمانية أقسام كبطاقات تعرض مجموعاتها وتوزيع مستوياتها؛
// مع تصفية بالمستوى أو المفضلة تظهر الموضوعات المطابقة مباشرة تحت كل قسم.
export default function TechHubScreen({ onBack, onBranch, onTopic }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getTechTree(), []);
  const [level, setLevel] = useState("all");
  const [onlyMarked, setOnlyMarked] = useState(false);
  const filtering = level !== "all" || onlyMarked;
  const branches = useMemo(() => (data?.branches || []).map((b) => {
    const all = b.groups.flatMap((g) => g.topics);
    const shown = all.filter((t) => (level === "all" || t.level === level) && (!onlyMarked || t.marked));
    const dist = Object.fromEntries(LEVELS.map(([k]) => [k, all.filter((t) => t.level === k).length]));
    return { ...b, all, shown, dist };
  }), [data, level, onlyMarked]);

  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="التقنية" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  return shell(
    <>
      <p style={{ margin: 0, color: C.muted, lineHeight: 1.8 }}>{num(data.total)} موضوعاً في ثمانية أقسام، كل موضوع بمستواه: أساسي لمن يستعمل، متوسط لمن يريد أن يفهم كيف يعمل، متقدم للمهتم. اختر قسماً أو ابحث مباشرة.</p>
      <TechSearch level={level} onLevel={setLevel} onlyMarked={onlyMarked} onOnlyMarked={setOnlyMarked} onPick={onTopic} count={data.total} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: S.x3 }}>
        {branches.map((b) => { const { Icon, hue } = metaOf(b.id); return (
          <section key={b.id} aria-label={b.title} style={{ background: C.surface, border: `1px solid ${C.line}`, borderInlineStart: `4px solid ${hue}`, borderRadius: R.x3, padding: S.x4, display: "grid", gap: S.lg, boxShadow: "var(--shadow-1)" }}>
            <button type="button" onClick={() => onBranch(b.id)} style={{ display: "flex", alignItems: "center", gap: S.x2, width: "100%", background: "transparent", border: 0, padding: 0, color: C.text, fontFamily: "inherit", textAlign: "start", cursor: "pointer" }}>
              <span style={{ width: 48, height: 48, borderRadius: R.xl, background: alpha(hue, 0.15), display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={24} color={hue} aria-hidden="true" /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: T.x2 }}>{b.title}</span>
                <span dir="ltr" style={{ display: "block", color: C.muted, fontSize: T.xs, textAlign: "start" }}>{b.en} · {num(b.all.length)} topics</span>
              </span>
              <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
            </button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: S.sm }}>
              {b.groups.map((g) => <span key={g.id} style={{ fontSize: T.xs, color: C.muted, background: C.surface2, borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px` }}>{g.title}</span>)}
            </div>
            <div style={{ display: "flex", gap: S.lg, fontSize: T.xs }}>
              {LEVELS.map(([k, l]) => <span key={k} className="madar-num" style={{ color: levelTone(k) }}>{l} {num(b.dist[k])}</span>)}
            </div>
            {filtering && (
              <div style={{ display: "grid", gap: S.sm }}>
                {b.shown.length ? b.shown.map((t) => (
                  <button key={t.id} type="button" onClick={() => onTopic(t.id)} style={{ display: "flex", alignItems: "center", gap: S.md, minHeight: 44, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontFamily: "inherit", fontSize: T.sm, textAlign: "start", cursor: "pointer" }}>
                    {t.marked && <Heart size={12} color={C.red} fill={C.red} aria-hidden="true" />}<span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span><span style={{ color: levelTone(t.level), fontSize: T.xs }}>{LEVEL_LABEL[t.level]}</span>
                  </button>
                )) : <div style={{ color: C.muted, fontSize: T.xs }}>لا شيء يطابق التصفية هنا.</div>}
              </div>
            )}
          </section>
        ); })}
      </div>
    </>,
  );
}
