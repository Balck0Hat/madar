import { useState } from "react";
import { C, MONO, inputStyle } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Bar, TopBar } from "../../../shared/components/ui";
import OrderQuestion from "./OrderQuestion";
import { PROMPT, isReady, checkAnswer } from "../utils/quiz.utils";

export default function QuizScreen({ unitId, questions, onFinish, onBack }) {
  const num = useNum();
  const info = unitInfo(unitId);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i], total = questions.length;
  const locked = checked !== null;

  const check = () => {
    const ok = checkAnswer(q, sel);
    setChecked(ok);
    if (ok) setCorrect((c) => c + 1);
    vibrate(ok ? [20] : [40, 30, 40]);
  };
  const next = () => {
    if (i + 1 < total) { setI(i + 1); setSel(null); setChecked(null); } else onFinish(correct, total);
  };

  const opt = (label, key, isCorrect, isSel, onPick) => {
    const bg = locked && isCorrect ? C.green + "33" : locked && isSel ? C.red + "33" : isSel ? info.color + "26" : C.surface;
    const bd = locked && isCorrect ? C.green : locked && isSel ? C.red : isSel ? info.color : C.line;
    return (
      <button key={key} type="button" className={locked && isSel && !isCorrect ? "madar-shake" : ""} onClick={() => !locked && onPick()} aria-pressed={isSel} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 14, padding: "13px 14px", color: C.text, textAlign: "start", cursor: "pointer", fontSize: 15, lineHeight: 1.5 }}>
        {label}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar title="الاختبار" onBack={onBack} right={<span style={{ fontFamily: MONO, color: C.muted, fontSize: 12 }}>{num(i + 1)}/{num(total)}</span>} />
      <div style={{ padding: "0 16px 8px" }}><Bar value={(i + (locked ? 1 : 0)) / total} color={info.color} h={4} /></div>
      <div key={i} className="madar-in" style={{ flex: 1, padding: "10px 18px" }}>
        <div style={{ color: C.muted, fontSize: 12, fontWeight: 700 }}>{PROMPT[q.t]}</div>
        <div style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 16px", lineHeight: 1.6 }}>{q.q}</div>
        <div style={{ display: "grid", gap: 8 }}>
          {q.t === "mcq" && q.opts.map((o, k) => opt(o, k, k === q.a, sel === k, () => setSel(k)))}
          {q.t === "tf" && [["صح", true], ["خطأ", false]].map(([l, v]) => opt(l, l, v === q.a, sel === v, () => setSel(v)))}
          {q.t === "fill" && <input aria-label="إجابتك" value={sel || ""} onChange={(e) => !locked && setSel(e.target.value)} placeholder="اكتب إجابتك" style={inputStyle} />}
          {q.t === "open" && <textarea aria-label="إجابتك" value={sel || ""} onChange={(e) => !locked && setSel(e.target.value)} placeholder="جملة واحدة تكفي" rows={3} style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }} />}
          {q.t === "order" && <OrderQuestion items={q.items} sel={sel} color={info.color} locked={locked} onChange={setSel} />}
        </div>
        {locked && (
          <div className="madar-in" role="status" style={{ marginTop: 16, background: (checked ? C.green : C.red) + "1f", border: `1px solid ${checked ? C.green : C.red}66`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontWeight: 800, color: checked ? C.green : C.red, marginBottom: 4 }}>{checked ? "صحيح" : q.t === "open" ? "قصيرة جداً" : "ليست الإجابة"}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{q.why}</div>
          </div>
        )}
      </div>
      <div style={{ padding: "8px 16px 22px" }}>
        {!locked ? <Btn primary color={info.color} disabled={!isReady(q, sel)} onClick={check}>تحقق</Btn> : <Btn primary onClick={next}>{i + 1 < total ? "التالي" : "النتيجة"}</Btn>}
      </div>
    </div>
  );
}
