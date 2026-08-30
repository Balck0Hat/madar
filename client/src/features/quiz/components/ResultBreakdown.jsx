import { Zap } from "lucide-react";
import { C, MONO, T, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useCountUp } from "../../../shared/hooks/useCountUp";
import { Card } from "../../../shared/components/ui";
import { settled } from "./resultMotion";

const TOTAL = { fontFamily: MONO, color: C.gold, display: "flex", alignItems: "center", gap: S.sm };

function Line({ label, value, delay, last }) {
  const num = useNum();
  const live = settled(useCountUp(value, { duration: 600, delay }), value);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: `${S.md}px 0`, borderBottom: last ? "none" : `1px dashed ${C.line}`, fontSize: T.md }}>
      <span>{label}</span>
      <span style={{ fontFamily: MONO, color: C.gold, fontWeight: 700 }}>+{num(live)}</span>
    </div>
  );
}

// المجموع: القيمة النهائية تبقى في DOM دائماً (قراءة آلية واختبارات)،
// وطبقة العدّ تُرسم مكانها بصرياً حتى تصل إلى الرقم النهائي
function Total({ gain }) {
  const num = useNum();
  const live = settled(useCountUp(gain, { duration: 800, delay: 240 }), gain);
  const running = live !== gain;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: S.xl, fontWeight: 700, position: "relative" }}>
      <span>المجموع</span>
      <span style={{ ...TOTAL, visibility: running ? "hidden" : "visible" }}><Zap size={14} />+{num(gain)}</span>
      {running && <span aria-hidden="true" style={{ ...TOTAL, position: "absolute", insetInlineEnd: 0, top: 10 }}><Zap size={14} />+{num(live)}</span>}
    </div>
  );
}

export default function ResultBreakdown({ breakdown, gain }) {
  return (
    <Card>
      {breakdown.map(([label, value], k) => (
        <Line key={k} label={label} value={value} delay={80 + k * 90} last={k === breakdown.length - 1} />
      ))}
      <Total gain={gain} />
    </Card>
  );
}
