import { C, READ, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const Line = ({ label, text }) => (
  <div>
    <span style={{ fontWeight: 700, fontSize: T.sm }}>{label}: </span>
    <span style={{ fontFamily: READ, fontSize: T.lg, lineHeight: 1.85 }}>{text}</span>
  </div>
);

// أنواع الحكم: ما هو، كيف يصل الحاكم، من يحاسبه، وأمثلة. وصف للآلية لا حكم
// عليها. زر كل نوع ينقل إلى تبويب الدول مفلتراً به.
export default function SystemsTab({ systems = [], onShow }) {
  const num = useNum();
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <p style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, margin: 0 }}>
        اللقب لا يخبرك بحجم السلطة. ما يفرّق بين نظام وآخر ثلاثة أسئلة: كيف يصل الحاكم إلى منصبه، وكم يبقى فيه، ومن يستطيع محاسبته. الأعداد تقريبية لعالم اليوم.
      </p>
      {systems.map((s) => (
        <article key={s.systemId} style={{ background: C.surface, border: `1px solid ${C.line}`, borderInlineStart: `3px solid ${s.color}`, borderRadius: R.x3, padding: S.x4, display: "grid", gap: S.x2, boxShadow: "var(--shadow-1)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: S.lg }}>
            <h2 style={{ fontSize: T.x3, fontWeight: 700, margin: 0, flex: 1, color: s.color }}>{s.name}</h2>
            <span style={{ color: C.muted, fontSize: T.sm }}>{num(s.count)} دولة</span>
          </div>
          <div style={{ fontFamily: READ, fontSize: T.xl, lineHeight: 1.85 }}>{s.what}</div>
          <Line label="كيف يصل الحاكم" text={s.how} />
          <Line label="من يحاسبه" text={s.accountability} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: S.md }}>
            {s.examples.map((e) => <span key={e} style={{ fontSize: T.sm, background: alpha(s.color, 0.1), color: C.text, border: `1px solid ${alpha(s.color, 0.3)}`, borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}>{e}</span>)}
          </div>
          {s.note && <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8 }}>{s.note}</div>}
          {s.ours > 0 && (
            <button type="button" onClick={() => onShow?.(s.name)} className="madar-press"
              style={{ justifySelf: "start", minHeight: TAP, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer", color: s.color, background: alpha(s.color, 0.12), border: `1px solid ${alpha(s.color, 0.4)}`, borderRadius: R.pill, padding: `${S.md}px ${S.x3}px` }}>
              اعرض دولنا من هذا النوع · {num(s.ours)}
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
