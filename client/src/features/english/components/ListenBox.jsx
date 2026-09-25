import { useEffect, useRef, useState } from "react";
import { Volume2, Square, RotateCcw } from "lucide-react";
import { C, R, S, T } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import { useSpeech } from "../hooks/useSpeech";

const MAX_PLAYS = 2; // كما في الامتحان: مرة، وإعادة واحدة
const ACCENT = { gb: "لهجة بريطانية", us: "لهجة أمريكية" };

// صندوق الاستماع: ملف صوتي حقيقي (أصوات عصبية وُلّدت على الخادم)، وإن تعذّر تحميله
// يقرأ المتصفح النصّ بصوته. عدّاد التشغيل مشترك بين الطريقتين.
export default function ListenBox({ part }) {
  const audio = useRef(null);
  const [plays, setPlays] = useState(0);
  const [state, setState] = useState("idle"); // idle | playing | done
  const [fallback, setFallback] = useState(false);
  const speech = useSpeech();
  useEffect(() => { setPlays(0); setState("idle"); setFallback(false); speech.stop(); }, [part.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fallback) setState(speech.state === "playing" ? "playing" : speech.state === "done" ? "done" : "idle"); }, [fallback, speech.state]);

  const left = MAX_PLAYS - plays;
  const play = () => {
    if (left <= 0) return;
    setPlays((n) => n + 1);
    if (fallback || !part.audio) { setFallback(true); speech.play(part.lines); return; }
    const a = audio.current;
    a.currentTime = 0;
    a.play().then(() => setState("playing")).catch(() => { setFallback(true); speech.play(part.lines); });
  };
  const stop = () => { if (fallback) speech.stop(); else { audio.current?.pause(); setState("idle"); } };
  const playing = state === "playing";

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, display: "grid", gap: S.lg }}>
      {part.audio && <audio ref={audio} src={part.audio} preload="auto" onEnded={() => setState("done")} onError={() => setFallback(true)} />}
      <div style={{ fontSize: T.sm, color: C.muted, lineHeight: 1.7 }}>
        {fallback && !speech.supported ? "تعذّر الصوت على هذا المتصفح؛ جرّب كروم أو سفاري." : `اضغط للاستماع${part.accent ? ` (${ACCENT[part.accent]})` : ""}. تستطيع الإعادة مرة واحدة كما في الامتحان الحقيقي، ثم أجب.`}
      </div>
      <div style={{ display: "flex", gap: S.lg, alignItems: "center", flexWrap: "wrap" }}>
        <Btn primary full={false} small onClick={playing ? stop : play} disabled={!playing && (left <= 0 || (fallback && !speech.supported))}>
          {playing ? <><Square size={14} aria-hidden="true" /> إيقاف</> : plays > 0 ? <><RotateCcw size={14} aria-hidden="true" /> إعادة</> : <><Volume2 size={14} aria-hidden="true" /> استمع</>}
        </Btn>
        <span style={{ color: C.muted, fontSize: T.xs }}>{playing ? "يُشغَّل…" : left > 0 ? `متبقٍ ${left === 2 ? "مرتان" : "مرة واحدة"}` : "انتهت مرات الاستماع"}</span>
      </div>
    </div>
  );
}
