import { Check, X } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";

// سؤال «اختر ثلاثاً» (ملخّص توفل): يُحدَّد العدد المطلوب، وبعد التصحيح تُلوَّن الخيارات
export default function MultiSelect({ q, opts, pick = 3, value = [], onChange, answer, disabled = false, compact = false }) {
  const done = Array.isArray(answer);
  const toggle = (i) => {
    if (disabled || done) return;
    const has = value.includes(i);
    if (!has && value.length >= pick) return;
    onChange(has ? value.filter((x) => x !== i) : [...value, i]);
  };
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div dir="ltr" style={{ fontSize: compact ? T.lg : T.x2, fontWeight: 600, lineHeight: 1.6, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif" }}>{q}</div>
      <div style={{ color: C.muted, fontSize: T.xs }}>اختر {pick} · اخترت {value.length}</div>
      <div style={{ display: "grid", gap: S.md }}>
        {opts.map((o, i) => {
          const picked = value.includes(i);
          const right = done && answer.includes(i), wrong = done && picked && !answer.includes(i);
          return (
            <button key={i} type="button" dir="ltr" role="checkbox" aria-checked={picked} disabled={disabled || done} onClick={() => toggle(i)} className="madar-press"
              style={{ display: "flex", alignItems: "center", gap: S.lg, minHeight: TAP, textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.base, cursor: done ? "default" : "pointer", color: C.text, padding: `${S.lg}px ${S.x3}px`, borderRadius: R.xl,
                background: right ? alpha(C.green, 0.16) : wrong ? alpha(C.red, 0.16) : picked ? alpha(C.gold, 0.14) : C.surface, border: `1px solid ${right ? C.green : wrong ? C.red : picked ? C.gold : C.line}` }}>
              <span style={{ width: 22, height: 22, borderRadius: R.sm, border: `1px solid ${picked || right ? C.gold : C.line}`, display: "grid", placeItems: "center", flexShrink: 0, background: picked && !done ? C.gold : "transparent", color: C.bg }}>
                {right ? <Check size={14} color={C.green} /> : wrong ? <X size={14} color={C.red} /> : picked ? <Check size={14} /> : null}
              </span>
              <span style={{ minWidth: 0, lineHeight: 1.5 }}>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
