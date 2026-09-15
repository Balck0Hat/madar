import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { C, P, alpha, R, S, TAP } from "../../constants/theme";
import { vibrate } from "../../utils/text";

// «سؤال سريع» في ذيل البطاقة، مطويّ. اختياريّ بالكامل: من يريد أن يقرأ يمرّ
// عنه، ومن يريد أن يتأكد يفتحه. لا نقاط ولا حفظ ولا خادم — تثبيت للمعلومة فقط.
// السؤال من بنك الوحدة نفسه (بإجابته وشرحه المدقَّقين)، اختارته checks.js
// لأنه يسأل عمّا في هذه البطاقة تحديداً.
export default function CheckIn({ question, color = P.gold }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  if (!question) return null;

  const opts = question.t === "tf" ? [["صح", true], ["خطأ", false]] : question.opts.map((o, i) => [o, i]);
  const picked = sel !== null;
  const pick = (v) => {
    if (picked) return;
    setSel(v);
    vibrate(v === question.a ? [20] : [40, 30, 40]);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-expanded="false"
        style={{ marginTop: S.x4, minHeight: TAP, display: "flex", alignItems: "center", gap: S.md, background: "none", border: 0, borderTop: `1px dashed ${P.line}`, width: "100%", padding: `${S.lg}px 0 0`, color: P.muted, fontFamily: "inherit", fontSize: ".85em", fontWeight: 600, cursor: "pointer" }}>
        <ChevronDown size={15} aria-hidden="true" />سؤال سريع <span style={{ fontWeight: 400 }}>· اختياري</span>
      </button>
    );
  }

  return (
    <div className="madar-in" style={{ marginTop: S.x4, borderTop: `1px dashed ${P.line}`, paddingTop: S.x2 }}>
      <div style={{ fontWeight: 700, fontSize: ".95em", lineHeight: 1.6, marginBottom: S.xl }}>{question.q}</div>
      <div style={{ display: "grid", gap: S.lg }}>
        {opts.map(([label, v]) => {
          const right = picked && v === question.a, wrong = picked && v === sel && v !== question.a;
          const bg = right ? alpha(C.green, 0.2) : wrong ? alpha(C.red, 0.2) : P.card;
          const bd = right ? C.green : wrong ? C.red : P.line;
          return (
            <button key={String(v)} type="button" className={`madar-opt ${right && v === sel ? "madar-affirm" : wrong ? "madar-shake" : ""}`} onClick={() => pick(v)} aria-pressed={sel === v}
              style={{ display: "flex", alignItems: "center", gap: S.lg, background: bg, border: `1px solid ${bd}`, borderRadius: R.xl, padding: `${S.xl}px ${S.x3}px`, color: P.ink, textAlign: "start", cursor: picked ? "default" : "pointer", fontSize: ".92em", minHeight: TAP, fontFamily: "inherit" }}>
              {right && <Check size={15} color={C.green} aria-hidden="true" />}
              {wrong && <X size={15} color={C.red} aria-hidden="true" />}
              <span style={{ minWidth: 0 }}>{label}</span>
            </button>
          );
        })}
      </div>
      {picked && question.why && (
        <div className="madar-in" role="status" style={{ marginTop: S.x2, color: P.muted, fontSize: ".88em", lineHeight: 1.7, borderInlineStart: `3px solid ${alpha(color, 0.6)}`, paddingInlineStart: S.x2 }}>
          {question.why}
        </div>
      )}
    </div>
  );
}
