import { useEffect, useState } from "react";
import { Heart, Cog, Lightbulb, BookA, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, MessagesSquare } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getTechTopic, toggleTechMark } from "../services/tech.service";
import { metaOf, levelTone, LEVEL_LABEL } from "./tech.meta";
import QuestionCard from "./QuestionCard";

const Section = ({ icon: Icon, title, hue, children }) => (
  <section style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
    <h2 style={{ margin: 0, fontSize: T.lg, fontWeight: 700, display: "flex", alignItems: "center", gap: S.md }}><Icon size={18} color={hue} aria-hidden="true" />{title}</h2>
    {children}
  </section>
);

// صفحة موضوع تقني: التعريف، كيف يعمل، في حياتك، المصطلحات، مفاهيم خاطئة، موضوعات مرتبطة، والسابق/التالي في المجموعة
export default function TopicScreen({ topicId, onBack, onOpen, onBranch }) {
  const { data: t, loading, error, reload } = useAsync(() => getTechTopic(topicId), [topicId]);
  const [marked, setMarked] = useState(false);
  useEffect(() => { if (t) setMarked(t.marked); window.scrollTo({ top: 0 }); }, [t]);
  const mark = async () => { const next = !marked; setMarked(next); try { const r = await toggleTechMark(topicId); setMarked(r.marked); } catch (err) { setMarked(!next); } };
  const { hue } = metaOf(t?.path?.branch?.id);
  const shell = (children) => (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title={t?.path?.branch?.title || "التقنية"} onBack={onBack} right={t && <button type="button" onClick={mark} aria-pressed={marked} aria-label={marked ? "أزل من المفضلة" : "أضف إلى المفضلة"} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${C.line}`, background: "transparent", color: marked ? C.red : C.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><Heart size={18} fill={marked ? C.red : "none"} /></button>} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={10} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);
  return shell(
    <>
      <div style={{ color: C.muted, fontSize: T.xs }}><button type="button" onClick={() => onBranch(t.path.branch.id)} style={{ background: "transparent", border: 0, padding: 0, color: hue, fontFamily: "inherit", fontSize: T.xs, cursor: "pointer" }}>{t.path.branch.title}</button> › {t.path.group.title}</div>
      <h1 style={{ margin: 0, fontSize: T.x4, fontWeight: 700, lineHeight: 1.3 }}>{t.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.base, fontWeight: 400 }}>{t.en}</span></h1>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, flexWrap: "wrap" }}>
        <span style={{ fontSize: T.xs, fontWeight: 700, color: levelTone(t.level), background: alpha(levelTone(t.level), 0.12), borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px` }}>{LEVEL_LABEL[t.level]}</span>
      </div>
      <p style={{ margin: 0, fontSize: T.lg, lineHeight: 1.9, background: alpha(hue, 0.08), borderInlineStart: `4px solid ${hue}`, borderRadius: R.lg, padding: S.x3 }}>{t.summary}</p>
      <Section icon={Cog} title="كيف يعمل" hue={hue}><ol style={{ margin: 0, paddingInlineStart: S.x5, lineHeight: 1.9, display: "grid", gap: S.sm }}>{t.how.map((h, i) => <li key={i}>{h}</li>)}</ol></Section>
      <Section icon={Lightbulb} title="في حياتك" hue={hue}><ul style={{ margin: 0, paddingInlineStart: S.x5, lineHeight: 1.9, display: "grid", gap: S.sm }}>{t.uses.map((u, i) => <li key={i}>{u}</li>)}</ul></Section>
      <Section icon={BookA} title="مصطلحات تسمعها" hue={hue}>
        {t.terms.map((x, i) => <div key={i} style={{ display: "grid", gap: S.xs, borderInlineStart: `3px solid ${alpha(hue, 0.5)}`, paddingInlineStart: S.x2 }}><div><b dir="ltr" style={{ fontFamily: "Georgia, serif" }}>{x.en}</b> <span style={{ color: C.muted }}>· {x.ar}</span></div><div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>{x.note}</div></div>)}
      </Section>
      <Section icon={AlertTriangle} title="مفاهيم خاطئة شائعة" hue={C.red}>
        {t.myths.map((m, i) => <div key={i} style={{ display: "grid", gap: S.xs, borderInlineStart: `3px solid ${alpha(C.red, 0.5)}`, paddingInlineStart: S.x2, lineHeight: 1.8 }}><div><s style={{ color: C.red }}>{m.wrong}</s> <ArrowRight size={12} aria-hidden="true" /> <b style={{ color: C.green }}>{m.right}</b></div><div style={{ color: C.muted, fontSize: T.sm }}>{m.note}</div></div>)}
      </Section>
      {t.interview?.length > 0 && (
        <Section icon={MessagesSquare} title="أسئلة مقابلة" hue={hue}>
          <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>أجب في رأسك ثم اكشف الجواب النموذجي.</div>
          {t.interview.map((q, i) => <QuestionCard key={i} item={q} index={i + 1} />)}
        </Section>
      )}
      {t.related.length > 0 && <div style={{ display: "flex", gap: S.sm, flexWrap: "wrap" }}>{t.related.map((r) => <button key={r.id} type="button" onClick={() => onOpen(r.id)} style={{ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${C.line}`, background: C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, cursor: "pointer" }}>{r.title}</button>)}</div>}
      <div style={{ display: "flex", gap: S.lg }}>
        {t.prev && <Btn paper onClick={() => onOpen(t.prev.id)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><ChevronRight size={16} aria-hidden="true" />{t.prev.title}</span></Btn>}
        {t.next && <Btn primary onClick={() => onOpen(t.next.id)}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}>{t.next.title}<ChevronLeft size={16} aria-hidden="true" /></span></Btn>}
      </div>
    </>,
  );
}
