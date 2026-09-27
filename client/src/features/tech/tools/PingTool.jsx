import { useState } from "react";
import { Activity } from "lucide-react";
import { C, R, S, T, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { pingServer } from "../services/tech.service";
import { Box, Bar, Note, toneForMs } from "./toolUi";

const ROUNDS = 5;
// أداة الكمون: خمس نبضات إلى خادم مدار وقياس زمن الذهاب والعودة من متصفحك
export default function PingTool({ hue = C.gold }) {
  const num = useNum();
  const [rounds, setRounds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async () => {
    setBusy(true); setRounds([]); setError(null);
    try {
      for (let i = 0; i < ROUNDS; i++) { const t0 = performance.now(); await pingServer(); const ms = Math.round(performance.now() - t0); setRounds((r) => [...r, ms]); }
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  const done = rounds.length === ROUNDS;
  const min = Math.min(...rounds), max = Math.max(...rounds), avg = Math.round(rounds.reduce((a, b) => a + b, 0) / (rounds.length || 1));
  const verdict = avg < 60 ? "ممتاز: يصلح للألعاب والمكالمات." : avg < 150 ? "جيد: التصفح سلس، والألعاب التنافسية قد تتأخر قليلاً." : "مرتفع: ستشعر بتأخير في المكالمات والألعاب. جرّب الاقتراب من الراوتر أو الكابل.";
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <Note>الكمون لا السرعة: كم ملّي ثانية تحتاج رزمة صغيرة لتذهب من متصفحك إلى خادم مدار وتعود. السرعة (Mbps) شيء آخر.</Note>
      <button type="button" onClick={run} disabled={busy} style={{ minHeight: TAP, borderRadius: R.xl, border: 0, background: hue, color: C.bg, fontFamily: "inherit", fontWeight: 700, fontSize: T.lg, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>
        <Activity size={18} aria-hidden="true" />{busy ? `يقيس… ${num(rounds.length)} / ${num(ROUNDS)}` : "قِس الكمون"}
      </button>
      {error && <Box tone={C.red}>{error}</Box>}
      {rounds.length > 0 && (
        <Box aria-live="polite">
          {rounds.map((ms, i) => <Bar key={i} value={ms} max={Math.max(200, max)} tone={toneForMs(ms)} label={`${num(ms)} ms`} />)}
          {done && <div style={{ display: "flex", gap: S.x3, flexWrap: "wrap", fontSize: T.sm }} className="madar-num"><span>الأدنى {num(min)}</span><span>المتوسط <b style={{ color: toneForMs(avg) }}>{num(avg)}</b></span><span>الأعلى {num(max)}</span></div>}
          {done && <Note>{verdict} القياس يشمل HTTPS كاملاً فهو أعلى قليلاً من ping الخام؛ أول نبضة غالباً الأبطأ لأنها تفتح الاتصال.</Note>}
        </Box>
      )}
    </div>
  );
}
