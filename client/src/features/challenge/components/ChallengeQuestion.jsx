import { useState } from "react";
import { C, alpha, inputStyle, T, R, S } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";

const TF = [["صح", true], ["خطأ", false]];

// خيار واحد: بعد الإجابة يلوّن الصحيح أخضر والمختار الخاطئ أحمر
function Option({ label, picked, isCorrect, locked, onPick }) {
  const bg = locked && isCorrect ? alpha(C.green, 0.2) : locked && picked ? alpha(C.red, 0.2) : picked ? alpha(C.gold, 0.15) : C.surface2;
  const bd = locked && isCorrect ? C.green : locked && picked ? C.red : picked ? C.gold : C.line;
  return (
    <button type="button" onClick={locked ? undefined : onPick} disabled={locked} aria-pressed={picked}
      style={{ background: bg, border: `1px solid ${bd}`, borderRadius: R.lg, padding: `${S.xl}px ${S.x2}px`, color: C.text, textAlign: "start", cursor: locked ? "default" : "pointer", fontSize: T.md, lineHeight: 1.5, fontFamily: "inherit" }}>
      {label}
    </button>
  );
}

// أنواع mcq/tf تُجاب داخل البطاقة؛ غيرها يُفتح بحقل نص عند الضغط على «جرّب»
export default function ChallengeQuestion({ question, result, submitting, onSubmit }) {
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);
  const locked = !!result;
  const answer = result?.a;
  const choice = question.t === "mcq" || question.t === "tf";

  const pick = (value) => { setSel(value); onSubmit(value); };
  const isCorrectOpt = (value) => locked && answer !== undefined && answer !== null && String(answer) === String(value);

  if (choice) {
    const opts = question.t === "tf" ? TF : (question.opts || []).map((o, k) => [o, k]);
    return (
      <div style={{ display: "grid", gap: S.md, marginTop: S.xl }} role="group" aria-label="اختر إجابة">
        {opts.map(([label, value]) => (
          <Option key={String(value)} label={label} picked={sel === value} isCorrect={isCorrectOpt(value)} locked={locked || submitting} onPick={() => pick(value)} />
        ))}
      </div>
    );
  }

  if (!open) {
    return <div style={{ marginTop: S.xl }}><Btn small full={false} onClick={() => setOpen(true)}>جرّب</Btn></div>;
  }
  return (
    <div style={{ display: "flex", gap: S.lg, marginTop: S.xl }}>
      <input aria-label="إجابتك" value={sel || ""} onChange={(e) => setSel(e.target.value)} placeholder="اكتب إجابتك" disabled={locked || submitting} style={{ ...inputStyle, fontSize: T.md, padding: `${S.xl}px ${S.x2}px` }} />
      <Btn primary small full={false} disabled={!String(sel || "").trim() || locked || submitting} onClick={() => onSubmit(sel)}>أرسل</Btn>
    </div>
  );
}
