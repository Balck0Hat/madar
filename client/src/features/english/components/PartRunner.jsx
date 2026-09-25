import { useState } from "react";
import { C, R, S, T, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import Choice from "./Choice";
import GapAnswer from "./GapAnswer";
import ListenBox from "./ListenBox";

// مقطع قراءة (نصّ يُعرض) أو استماع (صوت ولا يُعرض النصّ)، ثم أسئلته واحداً واحداً:
// اختيار من متعدد، أو صح/خطأ/غير مذكور، أو إكمال فراغ بالكتابة.
export default function PartRunner({ stage, part, onAnswer, feedback, onNext }) {
  const num = useNum();
  const [qi, setQi] = useState(Math.max(0, part.from || 0)); // بعد التحديث يُستأنف من أول سؤال لم يُجب
  const [picked, setPicked] = useState(null);
  const q = part.qs[qi];
  const listening = stage === "listening";
  const key = `${part.id}#${qi}`;
  const mine = feedback?.itemId === key;

  const pick = async (choice) => { setPicked(choice); await onAnswer(key, choice); };
  const next = () => { setPicked(null); if (qi + 1 < part.qs.length) setQi(qi + 1); else onNext(); };

  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>{listening ? "استماع" : "قراءة"} · المقطع {num(part.n)} من {num(part.of)} · السؤال {num(qi + 1)} من {num(part.qs.length)}</div>
      {listening ? <ListenBox part={part} /> : (
        <article dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: T.lg, lineHeight: 1.8, maxHeight: "40vh", overflowY: "auto" }}>
          <h3 style={{ margin: `0 0 ${S.md}px`, fontSize: T.x2 }}>{part.title}</h3>
          {String(part.text).split(/\n+/).map((p, i) => <p key={i} style={{ margin: `0 0 ${S.lg}px` }}>{p}</p>)}
        </article>
      )}
      {q.type === "gap"
        ? <GapAnswer key={key} q={q.q} picked={picked} answer={mine ? feedback.a : undefined} why={mine ? feedback.why : ""} onPick={pick} compact />
        : <Choice key={key} q={q.q} opts={q.opts} picked={picked} answer={mine ? feedback.a : undefined} why={mine ? feedback.why : ""} onPick={pick} compact />}
      {picked !== null && mine && (
        <button type="button" onClick={next} className="madar-press" style={{ minHeight: TAP, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: C.bg, background: C.gold, border: 0, borderRadius: R.xl }}>
          {qi + 1 < part.qs.length ? "السؤال التالي" : "المقطع التالي"}
        </button>
      )}
    </div>
  );
}
