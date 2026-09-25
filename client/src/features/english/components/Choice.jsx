import { Check, X } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { vibrate } from "../../../shared/utils/text";

// سؤال اختيار من متعدد بالإنجليزية (اتجاه يسار→يمين) مع كشف الجواب بعد الاختيار
export default function Choice({ q, opts, picked, answer, onPick, why, compact = false }) {
  const done = picked !== null && picked !== undefined;
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div dir="ltr" style={{ fontSize: compact ? T.lg : T.x2, fontWeight: 600, lineHeight: 1.6, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif" }}>{q}</div>
      <div style={{ display: "grid", gap: S.md }}>
        {opts.map((o, i) => {
          const right = done && i === answer, wrong = done && i === picked && i !== answer;
          return (
            <button key={i} type="button" dir="ltr" disabled={done} onClick={() => { onPick(i); vibrate([15]); }} aria-pressed={picked === i} className="madar-press"
              style={{ display: "flex", alignItems: "center", gap: S.lg, minHeight: TAP, textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.lg, cursor: done ? "default" : "pointer", color: C.text, padding: `${S.xl}px ${S.x3}px`, borderRadius: R.xl,
                background: right ? alpha(C.green, 0.16) : wrong ? alpha(C.red, 0.16) : C.surface, border: `1px solid ${right ? C.green : wrong ? C.red : C.line}` }}>
              <span style={{ width: 22, height: 22, borderRadius: R.pill, border: `1px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: T.xs, color: C.muted, flexShrink: 0 }}>{right ? <Check size={14} color={C.green} /> : wrong ? <X size={14} color={C.red} /> : "ABCD"[i]}</span>
              <span style={{ minWidth: 0 }}>{o}</span>
            </button>
          );
        })}
      </div>
      {done && why && <div role="status" style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, borderInlineStart: `3px solid ${alpha(C.gold, 0.6)}`, paddingInlineStart: S.x2 }}>{why}</div>}
    </div>
  );
}
