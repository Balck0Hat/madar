import { useState } from "react";
import { Check, X } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";

// سؤال إكمال فراغ: يكتب المتعلم كلمة واحدة أو رقماً من النصّ ثم يتحقق؛ بعدها تظهر الإجابة المقبولة
export default function GapAnswer({ q, picked, answer, why, onPick, compact = false }) {
  const [text, setText] = useState("");
  const done = picked !== null && picked !== undefined;
  const right = done && answer !== undefined && String(picked).trim().toLowerCase() === String(answer).toLowerCase();
  const submit = (e) => { e.preventDefault(); if (text.trim() && !done) onPick(text.trim()); };
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: S.lg }}>
      <div dir="ltr" style={{ fontSize: compact ? T.lg : T.x2, fontWeight: 600, lineHeight: 1.6, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif" }}>{q}</div>
      <div style={{ color: C.muted, fontSize: T.xs }}>كلمة واحدة أو رقم من النصّ</div>
      <div style={{ display: "flex", gap: S.lg }}>
        <input dir="ltr" value={text} onChange={(e) => setText(e.target.value)} disabled={done} aria-label="إجابة الفراغ" autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={40}
          style={{ ...inputStyle, flex: 1, fontFamily: "Georgia, serif", fontSize: T.lg, textAlign: "left", borderColor: done ? (right ? C.green : C.red) : undefined }} />
        {!done && <button type="submit" disabled={!text.trim()} className="madar-press" style={{ minHeight: TAP, padding: `0 ${S.x3}px`, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: C.bg, background: C.gold, border: 0, borderRadius: R.xl }}>تحقق</button>}
      </div>
      {done && (
        <div dir="ltr" role="status" style={{ display: "flex", alignItems: "center", gap: S.md, textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.lg, color: right ? C.green : C.red }}>
          {right ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
          {right ? <span>{answer}</span> : <span><s>{picked}</s> → <b style={{ color: C.green }}>{answer}</b></span>}
        </div>
      )}
      {done && why && <div role="status" style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, borderInlineStart: `3px solid ${alpha(C.gold, 0.6)}`, paddingInlineStart: S.x2 }}>{why}</div>}
    </form>
  );
}
