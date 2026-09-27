import { useEffect, useRef } from "react";
import { X, Lock, Check, Circle, Compass, ArrowLeft, Crown } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import { toneColor } from "../world/worldLayout";

const STATUS = { completed: "مكتملة", current: "محطتك الحالية", next: "المحطة التالية", locked: "مقفلة" };

// ورقة المحطة: على الهاتف من الأسفل، على الشاشة الواسعة لوح جانبي والعالم ظاهر.
// تعرض تقدّم المحطة ودروسها، و«تابع الرحلة» للمحطة الحالية، و«استكشف المحطة» لخريطتها التفصيلية.
export default function StageSheet({ stage, prev, desktop, onClose, onContinue, onExplore }) {
  const num = useNum();
  const box = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    box.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); before?.focus?.(); };
  }, [onClose, stage.id]);
  const tone = toneColor(stage.tone);
  const { done, total } = stage.progress;
  const panel = (
    <div ref={box} tabIndex={-1} role="dialog" aria-modal={!desktop} aria-label={stage.title} className="madar-rise"
      style={{ background: C.surface, color: C.text, borderRadius: desktop ? R.x3 : `${R.x3}px ${R.x3}px 0 0`, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-3)", outline: "none", borderTop: `4px solid ${tone}`, width: "100%", maxWidth: desktop ? 360 : 520, maxHeight: "75vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: S.lg }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: tone, fontSize: T.xs, fontWeight: 700 }}>المحطة <span className="madar-num">{num(stage.art.n)}</span> · {STATUS[stage.status]}</div>
          <div style={{ fontWeight: 700, fontSize: T.x3, marginTop: S.xs }}>{stage.title}</div>
          <div dir="ltr" style={{ color: C.muted, fontSize: T.sm, textAlign: "end" }}>{stage.en} · {stage.level}</div>
        </div>
        <button type="button" onClick={onClose} aria-label="إغلاق" style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: "transparent", color: C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={18} /></button>
      </div>
      <div style={{ display: "grid", gap: S.sm }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.sm }}><span>التقدّم</span><span className="madar-num">{num(done)} / {num(total)} دروس متقنة</span></div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="تقدّم المحطة" style={{ height: S.lg, borderRadius: R.pill, background: C.line, overflow: "hidden" }}><div style={{ width: `${total ? (done / total) * 100 : 0}%`, height: "100%", background: tone, borderRadius: R.pill }} /></div>
      </div>
      {stage.status === "locked" && prev && <div role="status" style={{ display: "flex", alignItems: "center", gap: S.md, color: C.muted, fontSize: T.sm, background: alpha(C.text, 0.05), borderRadius: R.lg, padding: `${S.md}px ${S.x2}px`, lineHeight: 1.6 }}><Lock size={14} aria-hidden="true" />اجتز زعيم «{prev.title}» لتُفتح هذه المحطة.</div>}
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: S.sm }}>
        {stage.nodes.map((nd) => (
          <li key={nd.tag} style={{ display: "flex", alignItems: "center", gap: S.lg, fontSize: T.md, color: nd.status === "locked" ? C.muted : C.text }}>
            {nd.status === "mastered" ? <Check size={16} color={C.green} aria-label="متقن" /> : nd.status === "locked" ? <Lock size={14} color={C.muted} aria-label="مقفل" /> : <Circle size={14} color={tone} aria-label="متاح" />}
            <span style={{ flex: 1 }}>{nd.title}</span>
            {nd.pct !== null && <span className="madar-num" style={{ color: C.muted, fontSize: T.xs }}>{num(nd.pct)}٪</span>}
          </li>
        ))}
        <li style={{ display: "flex", alignItems: "center", gap: S.lg, fontSize: T.md, color: stage.boss.status === "locked" ? C.muted : C.text }}><Crown size={16} color={stage.boss.status === "passed" ? C.gold : C.muted} aria-hidden="true" /><span style={{ flex: 1 }}>زعيم المحطة</span>{stage.boss.status === "passed" && <span style={{ color: C.green, fontSize: T.xs }}>مجتاز</span>}</li>
      </ul>
      <div style={{ display: "grid", gap: S.lg }}>
        {stage.status === "current" && <Btn primary onClick={onContinue}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}>تابع الرحلة<ArrowLeft size={16} aria-hidden="true" /></span></Btn>}
        <Btn paper={stage.status === "current"} primary={stage.status !== "current"} onClick={() => onExplore(stage.id)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Compass size={16} aria-hidden="true" />استكشف المحطة</span></Btn>
      </div>
    </div>
  );
  if (desktop) return <aside style={{ position: "fixed", top: 96, left: S.x6, width: 340, zIndex: 30 }}>{panel}</aside>;
  return (
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.45), display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center" }}>{panel}</div>
    </div>
  );
}
