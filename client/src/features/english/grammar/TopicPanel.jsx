import { useEffect, useRef, useState } from "react";
import { X, Heart, Settings, Lightbulb, MessageSquareQuote, AlertTriangle, ArrowRight } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getGrammarTopic, toggleGrammarMark } from "../services/english.service";

const TABS = [["overview", "نظرة عامة"], ["form", "الصيغة"], ["usage", "الاستعمال"], ["examples", "الأمثلة"], ["mistakes", "الأخطاء"]];
const SERIF = "Georgia, 'Times New Roman', serif";

const Section = ({ icon: Icon, title, hue, children }) => (
  <section style={{ background: C.surface2, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
    <h3 style={{ margin: 0, fontSize: T.base, fontWeight: 700, display: "flex", alignItems: "center", gap: S.md }}><Icon size={16} color={hue} aria-hidden="true" />{title}</h3>
    {children}
  </section>
);

// لوح الموضوع: مسار التصفح، العنوان، تبويبات (نظرة عامة، الصيغة، الاستعمال، الأمثلة، الأخطاء)، مفضلة، وتدريب
export default function TopicPanel({ topicId, hue, desktop, onClose, onOpen, onLesson, onPractice, onMarked }) {
  const box = useRef(null);
  const [tab, setTab] = useState("overview");
  const { data: t, loading, error, reload } = useAsync(() => getGrammarTopic(topicId), [topicId]);
  const [marked, setMarked] = useState(false);
  useEffect(() => { if (t) setMarked(t.marked); setTab("overview"); }, [t]);
  useEffect(() => {
    box.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose, topicId]);
  const mark = async () => { const next = !marked; setMarked(next); try { const r = await toggleGrammarMark(topicId); setMarked(r.marked); onMarked?.(topicId, r.marked); } catch (err) { setMarked(!next); } };
  const show = (k) => tab === "overview" || tab === k;

  const body = loading ? <Skeleton lines={8} /> : error ? <ErrorState message={error.message} onRetry={reload} /> : (
    <>
      <div style={{ color: C.muted, fontSize: T.xs }}>{t.path ? `${t.path.branch.title} › ${t.path.group.title}` : ""}</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: S.lg }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: T.x3, fontWeight: 700 }}>{t.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.sm, fontFamily: SERIF }}>{t.en}</span></h2>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs, lineHeight: 1.7 }}>{t.summary} <span className="madar-num" style={{ background: alpha(hue, 0.15), borderRadius: R.pill, padding: `0 ${S.md}px` }}>{t.level}</span></div>
        </div>
        <button type="button" onClick={mark} aria-pressed={marked} aria-label={marked ? "أزل من المفضلة" : "أضف إلى المفضلة"} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: "transparent", color: marked ? C.red : C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><Heart size={18} fill={marked ? C.red : "none"} /></button>
      </div>
      <div role="tablist" style={{ display: "flex", gap: S.sm, overflowX: "auto", paddingBottom: S.xs }}>
        {TABS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ flexShrink: 0, minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${tab === k ? hue : C.line}`, background: tab === k ? alpha(hue, 0.15) : "transparent", color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, cursor: "pointer" }}>{l}</button>)}
      </div>
      {show("form") && <Section icon={Settings} title="الصيغة" hue={hue}>{t.form.map((f, i) => <div key={i} dir="ltr" style={{ textAlign: "left", fontFamily: SERIF, fontSize: T.base, lineHeight: 1.7, background: C.surface, borderRadius: R.lg, padding: `${S.md}px ${S.x2}px` }}>{f}</div>)}</Section>}
      {show("usage") && <Section icon={Lightbulb} title="الاستعمال" hue={hue}><ul style={{ margin: 0, paddingInlineStart: S.x5, lineHeight: 1.9, fontSize: T.base }}>{t.usage.map((u, i) => <li key={i}>{u}</li>)}</ul></Section>}
      {show("examples") && <Section icon={MessageSquareQuote} title="أمثلة" hue={hue}>{t.examples.map((e, i) => <div key={i} style={{ display: "grid", gap: S.xs }}><div dir="ltr" style={{ textAlign: "left", fontFamily: SERIF, fontSize: T.lg }}>{e.en}</div><div style={{ color: C.muted, fontSize: T.sm }}>{e.ar}</div></div>)}</Section>}
      {show("mistakes") && <Section icon={AlertTriangle} title="أخطاء شائعة" hue={C.red}>{t.mistakes.map((m, i) => <div key={i} style={{ display: "grid", gap: S.xs, borderInlineStart: `3px solid ${alpha(C.red, 0.5)}`, paddingInlineStart: S.x2 }}><div dir="ltr" style={{ textAlign: "left", fontFamily: SERIF }}><s style={{ color: C.red }}>{m.wrong}</s> <ArrowRight size={12} aria-hidden="true" /> <b style={{ color: C.green }}>{m.right}</b></div><div style={{ color: C.muted, fontSize: T.sm }}>{m.note}</div></div>)}</Section>}
      {t.related.length > 0 && <div style={{ display: "flex", gap: S.sm, flexWrap: "wrap" }}>{t.related.map((r) => <button key={r.id} type="button" onClick={() => onOpen(r.id)} style={{ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, cursor: "pointer" }}>{r.title}</button>)}</div>}
      <div style={{ display: "grid", gap: S.lg }}>
        <Btn primary onClick={() => onPractice(t.tag)}>تدرّب على هذا الموضوع</Btn>
        <Btn paper onClick={() => onLesson(t.tag)}>الدرس المفصّل</Btn>
      </div>
    </>
  );
  const panel = (
    <div ref={box} tabIndex={-1} role="dialog" aria-modal={!desktop} aria-label={t?.title || "موضوع"} className="madar-rise"
      style={{ background: C.surface, color: C.text, borderRadius: desktop ? R.x3 : `${R.x3}px ${R.x3}px 0 0`, padding: S.x4, display: "grid", gap: S.x3, boxShadow: "var(--shadow-3)", outline: "none", borderTop: `4px solid ${hue}`, width: "100%", maxWidth: desktop ? 420 : 560, maxHeight: desktop ? "calc(100vh - 120px)" : "86vh", overflowY: "auto" }}>
      <button type="button" onClick={onClose} aria-label="إغلاق" style={{ position: "absolute", top: S.x2, insetInlineStart: S.x2, width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} /></button>
      {body}
    </div>
  );
  if (desktop) return <div style={{ position: "relative" }}>{panel}</div>;
  return (
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: alpha("#000", 0.5), display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative" }}>{panel}</div>
    </div>
  );
}
