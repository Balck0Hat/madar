import { useState } from "react";
import { Volume2, Square } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import { useSpeech } from "../hooks/useSpeech";
import Choice from "./Choice";

// مقطع قراءة (نصّ يُعرض) أو استماع (نصّ يُقرأ صوتياً ولا يُعرض)، ثم أسئلته واحداً واحداً
export default function PartRunner({ stage, part, onAnswer, feedback, onNext }) {
  const num = useNum();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const speech = useSpeech();
  const q = part.qs[qi];
  const listening = stage === "listening";
  const key = `${part.id}#${qi}`;

  const pick = async (i) => { setPicked(i); await onAnswer(key, i); };
  const next = () => { setPicked(null); if (qi + 1 < part.qs.length) setQi(qi + 1); else { speech.stop(); onNext(); } };

  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>{listening ? "استماع" : "قراءة"} · المقطع {num(part.n)} من {num(part.of)} · السؤال {num(qi + 1)} من {num(part.qs.length)}</div>
      {listening ? (
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
          <div style={{ fontSize: T.sm, color: C.muted, lineHeight: 1.7 }}>{speech.supported ? "اضغط للاستماع. تستطيع الإعادة مرة واحدة كما في الامتحان الحقيقي، ثم أجب." : "المتصفح لا يدعم القراءة الصوتية؛ جرّب كروم أو سفاري."}</div>
          <div style={{ display: "flex", gap: S.lg, alignItems: "center" }}>
            <Btn primary full={false} small onClick={() => (speech.state === "playing" ? speech.stop() : speech.play(part.lines))} disabled={!speech.supported}>
              {speech.state === "playing" ? <><Square size={14} aria-hidden="true" /> إيقاف</> : <><Volume2 size={14} aria-hidden="true" /> {speech.state === "done" ? "إعادة" : "استمع"}</>}
            </Btn>
            {speech.state === "playing" && <span style={{ color: C.muted, fontSize: T.xs }}>يتكلم {speech.line >= 0 ? part.lines[speech.line]?.who : ""}…</span>}
          </div>
        </div>
      ) : (
        <article dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: T.lg, lineHeight: 1.8, maxHeight: "40vh", overflowY: "auto" }}>
          <h3 style={{ margin: `0 0 ${S.md}px`, fontSize: T.x2 }}>{part.title}</h3>
          {String(part.text).split(/\n+/).map((p, i) => <p key={i} style={{ margin: `0 0 ${S.lg}px` }}>{p}</p>)}
        </article>
      )}
      <Choice q={q.q} opts={q.opts} picked={picked} answer={feedback?.itemId === key ? feedback.a : undefined} why={feedback?.itemId === key ? feedback.why : ""} onPick={pick} compact />
      {picked !== null && feedback?.itemId === key && (
        <button type="button" onClick={next} className="madar-press" style={{ minHeight: TAP, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: C.bg, background: C.gold, border: 0, borderRadius: R.xl }}>
          {qi + 1 < part.qs.length ? "السؤال التالي" : "المقطع التالي"}
        </button>
      )}
    </div>
  );
}
