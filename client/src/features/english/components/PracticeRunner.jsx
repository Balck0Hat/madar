import { useState } from "react";
import { C, S, T } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import Choice from "./Choice";

// تمرين سؤالاً سؤالاً (درس أو نقطة ضعف): اختيار، كشف الجواب وشرحه، ثم التالي؛ وفي النهاية تُبلَّغ النتيجة
export default function PracticeRunner({ items, onAnswer, onDone, label }) {
  const num = useNum();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [fb, setFb] = useState(null);
  const [err, setErr] = useState("");
  const q = items[qi];
  const pick = async (i) => {
    setPicked(i); setErr("");
    try { const r = await onAnswer(q.id, i); setFb(r); } catch (e) { setErr(e.message || "تعذّر الاتصال"); setPicked(null); }
  };
  const next = () => {
    if (fb?.done) { onDone(fb.score); return; }
    setQi(qi + 1); setPicked(null); setFb(null);
  };
  if (!q) return null;
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>{label} · السؤال {num(qi + 1)} من {num(items.length)}</div>
      <Choice key={q.id} q={q.q} opts={q.opts} picked={picked} answer={fb?.a} why={fb?.why} onPick={pick} />
      {err && <div role="alert" style={{ color: C.red, fontSize: T.sm }}>{err}</div>}
      {fb && <Btn primary onClick={next}>{fb.done ? "النتيجة" : "التالي"}</Btn>}
    </div>
  );
}
