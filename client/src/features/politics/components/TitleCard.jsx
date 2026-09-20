import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C, MONO, READ, alpha, T, R, S, TAP } from "../../../shared/constants/theme";

const Field = ({ label, text }) => (text ? (
  <div>
    <div style={{ color: C.gold, fontSize: T.xs, fontWeight: 700 }}>{label}</div>
    <div style={{ fontFamily: READ, fontSize: T.lg, lineHeight: 1.9, marginTop: S.xs }}>{text}</div>
  </div>
) : null);

// بطاقة لقب: مطوية تعرض الاسم وأصله ومعناه، ومفتوحة تعرض قصة الكلمة والمهام
// والمرتبة وأين يوجد اليوم وأشهر من حمله.
export default function TitleCard({ title: t, open: initial = false }) {
  const [open, setOpen] = useState(initial);
  return (
    <div style={{ background: C.surface, border: `1px solid ${open ? alpha(C.gold, 0.45) : C.line}`, borderRadius: R.x3, boxShadow: "var(--shadow-1)", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        style={{ display: "flex", alignItems: "flex-start", gap: S.x2, width: "100%", minHeight: TAP, textAlign: "start", fontFamily: "inherit", cursor: "pointer", background: "none", border: 0, color: C.text, padding: S.x4 }}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "block", fontWeight: 700, fontSize: T.x2 }}>{t.name}</span>
          <span style={{ display: "block", fontFamily: MONO, color: C.muted, fontSize: T.xs, marginTop: S.xs }}>{t.original}</span>
          <span style={{ display: "block", color: C.muted, fontSize: T.sm, lineHeight: 1.7, marginTop: S.md }}>{t.meaning}</span>
        </span>
        <ChevronDown size={18} color={C.muted} aria-hidden="true" style={{ flexShrink: 0, marginTop: S.sm, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div className="madar-in" style={{ display: "grid", gap: S.x3, padding: `0 ${S.x4}px ${S.x4}px` }}>
          <Field label="من أين جاءت الكلمة" text={t.origin} />
          <Field label="المهام" text={t.duties} />
          <Field label="المرتبة" text={t.rank} />
          <Field label="اليوم" text={t.today} />
          {t.holders?.length > 0 && (
            <div>
              <div style={{ color: C.gold, fontSize: T.xs, fontWeight: 700 }}>أشهر من حمله</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: S.md, marginTop: S.md }}>
                {t.holders.map((h) => <span key={h} style={{ fontSize: T.sm, color: C.text, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}>{h}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
