import { useEffect, useRef } from "react";
import { X, Lock, BookOpen, Target, Crown } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";

// بطاقة العقدة: على الهاتف ورقة من الأسفل، على الحاسوب لوح جانبي والخريطة ظاهرة.
// تعرض الموضوع ومستواه ونسبتك وما يغطيه الدرس، وأزرار الدرس والتمرين (أو الزعيم).
export default function NodeSheet({ node, boss, tone, desktop, onClose, onLesson, onPractice, onBoss }) {
  const num = useNum();
  const box = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    box.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); before?.focus?.(); };
  }, [onClose, node?.tag, boss?.id]);
  const locked = node ? node.status === "locked" : boss?.boss.status === "locked";
  const title = node ? node.title : `زعيم ${boss.title}`;
  const panel = (
    <div ref={box} tabIndex={-1} role="dialog" aria-modal={!desktop} aria-label={title} className="madar-rise"
      style={{ background: C.surface, color: C.text, borderRadius: desktop ? R.x3 : `${R.x3}px ${R.x3}px 0 0`, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-3)", outline: "none", borderInlineStart: `4px solid ${tone}`, width: "100%", maxWidth: desktop ? 360 : 520 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: S.lg }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.x2 }}>{title}</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>
            {node ? <>{node.level ? `المستوى ${node.level} · ` : ""}{node.minutes ? `${num(node.minutes)} دقيقة · ` : ""}{node.pct !== null ? `أفضل نتيجة ${num(node.pct)}٪` : "لم تُجرَّب بعد"}{node.status === "mastered" ? " · متقن" : ""}</> : `${num(boss.nodes.length)} مواضيع · 15 سؤالاً · النجاح 70٪${boss.boss.pct !== null ? ` · أفضل نتيجة ${num(boss.boss.pct)}٪` : ""}`}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="إغلاق" style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={18} /></button>
      </div>
      {locked && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: S.md, color: C.muted, fontSize: T.sm, background: alpha(C.text, 0.05), borderRadius: R.lg, padding: `${S.md}px ${S.x2}px`, lineHeight: 1.6 }}>
          <Lock size={14} aria-hidden="true" />{node ? (node.prereqs.length ? `أتقن أولاً: ${node.prereqs.map((p) => node.prereqTitles?.[p] || p).join("، ")}` : "اجتز زعيم الجزيرة السابقة أولاً") : "أتقن كل مواضيع الجزيرة (75٪ فأكثر) ليظهر الزعيم"}
        </div>
      )}
      {node?.topics?.length > 0 && (
        <ul style={{ margin: 0, paddingInlineStart: S.x5, color: C.text, fontSize: T.sm, lineHeight: 1.8 }}>{node.topics.map((t) => <li key={t}>{t}</li>)}</ul>
      )}
      {node?.tip && <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7, borderInlineStart: `3px solid ${alpha(C.gold, 0.6)}`, paddingInlineStart: S.x2 }}>{node.tip}</div>}
      <div style={{ display: "grid", gap: S.lg }}>
        {node && <Btn primary onClick={() => onLesson(node.tag)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><BookOpen size={16} aria-hidden="true" />{node.status === "mastered" ? "راجع الدرس" : "افتح الدرس"}</span></Btn>}
        {node && <Btn paper disabled={locked} onClick={() => onPractice(node.tag)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Target size={16} aria-hidden="true" />تمرين 10 أسئلة</span></Btn>}
        {boss && <Btn primary disabled={locked} onClick={() => onBoss(boss.id)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Crown size={16} aria-hidden="true" />{boss.boss.status === "passed" ? "أعد امتحان الزعيم" : "ابدأ امتحان الزعيم"}</span></Btn>}
      </div>
    </div>
  );
  if (desktop) return <aside style={{ position: "fixed", top: 96, left: S.x6, width: 340, zIndex: 30 }}>{panel}</aside>;
  return (
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.5), display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center" }}>{panel}</div>
    </div>
  );
}
