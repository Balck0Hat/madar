import { useState } from "react";
import { Heart, ChevronLeft, MessagesSquare } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getTechTree } from "../services/tech.service";
import { metaOf, LEVELS, levelTone, LEVEL_LABEL } from "./tech.meta";

// قسم واحد: تبويبات المستوى (الكل، أساسي، متوسط، متقدم)، ثم مجموعاته وموضوعاته صفوفاً بملخص قصير
export default function BranchScreen({ branchId, onBack, onTopic, onInterview }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => getTechTree(), [branchId]);
  const [level, setLevel] = useState("all");
  const b = data?.branches.find((x) => x.id === branchId);
  const { Icon, hue } = metaOf(branchId);
  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title={b?.title || "قسم"} onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error || !b) return shell(<ErrorState message={error?.message || "القسم غير موجود"} onRetry={reload} onBack={onBack} />);
  const total = b.groups.reduce((n, g) => n + g.topics.length, 0);
  return shell(
    <>
      <div style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <span style={{ width: 56, height: 56, borderRadius: R.xl, background: alpha(hue, 0.15), display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={28} color={hue} aria-hidden="true" /></span>
        <div><div style={{ fontWeight: 700, fontSize: T.x3 }}>{b.title}</div><div dir="ltr" style={{ color: C.muted, fontSize: T.sm, textAlign: "start" }}>{b.en} · {num(total)} topics</div></div>
      </div>
      {onInterview && (
        <button type="button" onClick={onInterview} style={{ display: "flex", alignItems: "center", gap: S.x2, minHeight: TAP, padding: `${S.lg}px ${S.x3}px`, borderRadius: R.x2, border: `1px solid ${alpha(hue, 0.5)}`, background: alpha(hue, 0.08), color: C.text, fontFamily: "inherit", textAlign: "start", cursor: "pointer" }}>
          <MessagesSquare size={20} color={hue} aria-hidden="true" />
          <span style={{ flex: 1 }}><span style={{ display: "block", fontWeight: 700 }}>أسئلة المقابلة</span><span style={{ display: "block", color: C.muted, fontSize: T.sm }}>{num(b.groups.reduce((n, g) => n + g.topics.reduce((m, t) => m + (t.questions || 0), 0), 0))} سؤالاً بإجابات نموذجية، ووضع «اختبرني»</span></span>
          <ChevronLeft size={16} color={C.muted} aria-hidden="true" />
        </button>
      )}
      <div role="tablist" aria-label="المستوى" style={{ display: "flex", gap: S.sm, overflowX: "auto", paddingBottom: S.xs }}>
        {[["all", "الكل"], ...LEVELS].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={level === k} onClick={() => setLevel(k)} style={{ flexShrink: 0, minHeight: TAP, padding: `0 ${S.x3}px`, borderRadius: R.pill, border: `1px solid ${level === k ? (k === "all" ? C.gold : levelTone(k)) : C.line}`, background: level === k ? alpha(k === "all" ? C.gold : levelTone(k), 0.15) : C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, cursor: "pointer" }}>{l}</button>)}
      </div>
      {b.groups.map((g) => {
        const topics = g.topics.filter((t) => level === "all" || t.level === level);
        if (!topics.length) return null;
        return (
          <section key={g.id} aria-label={g.title} style={{ display: "grid", gap: S.md }}>
            <h2 style={{ margin: 0, fontSize: T.lg, fontWeight: 700, color: hue }}>{g.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.xs, fontWeight: 400 }}>{g.en}</span></h2>
            {topics.map((t) => (
              <button key={t.id} type="button" onClick={() => onTopic(t.id)} aria-label={`${t.title} · ${LEVEL_LABEL[t.level] || ""}`}
                style={{ display: "flex", alignItems: "center", gap: S.lg, width: "100%", textAlign: "start", minHeight: TAP, padding: `${S.lg}px ${S.x3}px`, borderRadius: R.x2, border: `1px solid ${C.line}`, background: C.surface, color: C.text, fontFamily: "inherit", cursor: "pointer", boxShadow: "var(--shadow-1)" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: S.md, fontWeight: 700 }}>{t.marked && <Heart size={12} color={C.red} fill={C.red} aria-hidden="true" />}{t.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.xs, fontWeight: 400 }}>{t.en}</span></span>
                  {t.summary && <span style={{ display: "block", color: C.muted, fontSize: T.sm, lineHeight: 1.6, marginTop: S.xs, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.summary}</span>}
                </span>
                <span style={{ fontSize: T.xs, fontWeight: 700, color: levelTone(t.level), background: alpha(levelTone(t.level), 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, flexShrink: 0 }}>{LEVEL_LABEL[t.level]}</span>
                <ChevronLeft size={16} color={C.muted} aria-hidden="true" />
              </button>
            ))}
          </section>
        );
      })}
    </>,
  );
}
