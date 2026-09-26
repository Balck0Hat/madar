import { Check, X } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import MultiSelect from "./MultiSelect";

const letter = (i) => String.fromCharCode(65 + i);
const SERIF = "Georgia, 'Times New Roman', serif";

// سؤال واحد داخل قائمة أسئلة القسم (شكل الامتحان: كلها في صفحة واحدة ثم تسليم).
// value: الاختيار الحالي؛ result: بعد التصحيح { correct, a, why, choice }.
export default function QuestionItem({ n, q, value, onChange, result }) {
  const type = q.type || "mc";
  const done = Boolean(result);
  const head = (
    <div dir="ltr" style={{ display: "flex", gap: S.md, alignItems: "flex-start", textAlign: "left", fontFamily: SERIF, fontSize: T.lg, fontWeight: 600, lineHeight: 1.6 }}>
      <span className="madar-num" style={{ color: done ? (result.correct ? C.green : C.red) : C.gold, flexShrink: 0, minWidth: 24 }}>{done ? (result.correct ? <Check size={16} aria-label="صحيح" /> : <X size={16} aria-label="خطأ" />) : `${n}.`}</span>
      <span>{q.q}</span>
    </div>
  );
  const why = done && result.why && <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.8, borderInlineStart: `3px solid ${alpha(C.gold, 0.6)}`, paddingInlineStart: S.x2 }}>{result.why}</div>;

  if (type === "gap") return (
    <div style={{ display: "grid", gap: S.md }}>
      {head}
      <input dir="ltr" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={done} aria-label={`إجابة السؤال ${n}`} autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={60} placeholder={`${q.limit || 3} ${q.limit === 1 ? "word" : "words max"}`}
        style={{ ...inputStyle, fontFamily: SERIF, fontSize: T.lg, textAlign: "left", borderColor: done ? (result.correct ? C.green : C.red) : undefined }} />
      {done && !result.correct && <div dir="ltr" style={{ textAlign: "left", fontFamily: SERIF, color: C.green, fontWeight: 700 }}>✓ {result.a}</div>}
      {why}
    </div>
  );
  if (type === "multi") return (
    <div style={{ display: "grid", gap: S.md }}>
      <MultiSelect q={`${n}. ${q.q}`} opts={q.opts} pick={q.pick || 3} value={value || []} onChange={onChange} answer={done ? result.a : undefined} compact />
      {why}
    </div>
  );
  const chips = q.opts.every((o) => String(o).length <= 3); // خيارات قصيرة (حروف الفقرات): صف من الرقاقات
  return (
    <div style={{ display: "grid", gap: S.md }}>
      {head}
      <div role="radiogroup" aria-label={`خيارات السؤال ${n}`} dir="ltr" style={chips ? { display: "flex", flexWrap: "wrap", gap: S.sm } : { display: "grid", gap: S.sm }}>
        {q.opts.map((o, i) => {
          const picked = value === i, right = done && i === result.a, wrong = done && picked && i !== result.a;
          return (
            <button key={i} type="button" role="radio" aria-checked={picked} dir="ltr" disabled={done} onClick={() => onChange(i)} className="madar-press"
              style={{ display: "flex", alignItems: "center", justifyContent: chips ? "center" : "flex-start", gap: S.md, minHeight: TAP, minWidth: chips ? TAP : undefined, textAlign: "left", fontFamily: SERIF, fontSize: T.base, fontWeight: chips ? 700 : 400, lineHeight: 1.5, cursor: done ? "default" : "pointer", color: C.text, padding: chips ? `0 ${S.lg}px` : `${S.md}px ${S.x2}px`, borderRadius: R.lg,
                background: right ? alpha(C.green, 0.16) : wrong ? alpha(C.red, 0.16) : picked ? alpha(C.gold, 0.14) : C.surface, border: `1px solid ${right ? C.green : wrong ? C.red : picked ? C.gold : C.line}` }}>
              {!chips && <span style={{ width: 22, height: 22, borderRadius: R.pill, border: `1px solid ${picked ? C.gold : C.line}`, display: "grid", placeItems: "center", fontSize: T.xs, color: picked ? C.gold : C.muted, flexShrink: 0 }}>{letter(i)}</span>}
              <span style={{ minWidth: 0 }}>{o}</span>
            </button>
          );
        })}
      </div>
      {why}
    </div>
  );
}
