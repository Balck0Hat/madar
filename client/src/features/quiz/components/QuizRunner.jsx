import { useState } from "react";
import { C, MONO, inputStyle, alpha } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Bar, TopBar } from "../../../shared/components/ui";
import { saveAnswer } from "../services/quizAttempt.service";
import OrderQuestion from "./OrderQuestion";
import OpenSelfCheck from "./OpenSelfCheck";
import { PROMPT, isReady, checkAnswer } from "../utils/quiz.utils";

// الأسئلة والإجابات محفوظة على الخادم، فنبدأ من أول سؤال بلا إجابة بدل البداية من الصفر
const resumeAt = (total, saved) => Math.min(saved.length, total - 1);

// جولة الاختبار: التغذية الراجعة للمغلق فورية، والمفتوح يُقيَّم ذاتياً أو على الخادم بالنموذج
export default function QuizRunner({ unitId, questions, saved, onFinish, onBack }) {
  const num = useNum();
  const info = unitInfo(unitId);
  const total = questions.length;
  const [answers, setAnswers] = useState(saved);
  const [i, setI] = useState(resumeAt(total, saved));
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(null);
  const [mark, setMark] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[i];
  const locked = checked !== null;
  // self يضعه الخادم حين لا يوجد نموذج مصحّح: عندها يحكم المتعلم على نفسه
  const selfOpen = q.t === "open" && Boolean(q.self);
  const aiOpen = q.t === "open" && !q.self;

  // تُحفظ كل إجابة فور تسجيلها؛ فشل الحفظ لا يوقف الاختبار لأن الإجابات تُرسل كاملة عند النهاية
  const record = (entry) => {
    setAnswers((a) => [...a.filter((x) => x.qid !== entry.qid), entry]);
    saveAnswer(unitId, entry).catch(() => {});
  };

  const check = () => {
    if (q.t === "open") {
      setChecked("open");
      if (aiOpen) record({ qid: q.qid, answer: sel });
      return;
    }
    const ok = checkAnswer(q, sel);
    setChecked(ok);
    record({ qid: q.qid, answer: sel });
    vibrate(ok ? [20] : [40, 30, 40]);
  };
  const pickMark = (m) => { setMark(m); record({ qid: q.qid, answer: sel, selfMark: m }); };
  const next = async () => {
    if (i + 1 < total) { setI(i + 1); setSel(null); setChecked(null); setMark(null); return; }
    setSubmitting(true);
    try { await onFinish(answers); } finally { setSubmitting(false); }
  };

  const opt = (label, key, isCorrect, isSel, onPick) => {
    const bg = locked && isCorrect ? alpha(C.green, 0.2) : locked && isSel ? alpha(C.red, 0.2) : isSel ? alpha(info.color, 0.15) : C.surface;
    const bd = locked && isCorrect ? C.green : locked && isSel ? C.red : isSel ? info.color : C.line;
    return (
      <button key={key} type="button" className={locked && isSel && !isCorrect ? "madar-shake" : ""} onClick={() => !locked && onPick()} aria-pressed={isSel} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 14, padding: "13px 14px", color: C.text, textAlign: "start", cursor: "pointer", fontSize: 15, lineHeight: 1.5 }}>
        {label}
      </button>
    );
  };
  const verdictColor = checked === true ? C.green : checked === false ? C.red : C.gold;
  const verdict = checked === true ? "صحيح" : checked === false ? "ليست الإجابة" : "سُجّلت إجابتك، وتُقيَّم مع النتيجة";
  // لا يتقدّم قبل أن يحكم على نفسه: التقييم الذاتي هو غاية السؤال المفتوح لا خطوة اختيارية
  const canAdvance = !selfOpen || mark !== null;

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
        {locked && selfOpen && <OpenSelfCheck q={q} mark={mark} onMark={pickMark} />}
        {locked && !selfOpen && (
          <div className="madar-in" role="status" style={{ marginTop: 16, background: alpha(verdictColor, 0.12), border: `1px solid ${alpha(verdictColor, 0.4)}`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontWeight: 800, color: verdictColor, marginBottom: 4 }}>{verdict}</div>
            {q.t !== "open" && <div style={{ fontSize: 14, lineHeight: 1.7 }}>{q.why}</div>}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 16px 22px" }}>
        {!locked
          ? <Btn primary color={info.color} disabled={!isReady(q, sel)} onClick={check}>تحقق</Btn>
          : <Btn primary disabled={submitting || !canAdvance} onClick={next}>{submitting ? "يُصحَّح..." : i + 1 < total ? "التالي" : "النتيجة"}</Btn>}
      </div>
    </div>
  );
}
