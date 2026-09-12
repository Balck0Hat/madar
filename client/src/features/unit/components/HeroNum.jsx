import { MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { useCountUp } from "../hooks/useCountUp";
import { parseHero, formatHero } from "../utils/heroNum";

// الرقم البطل يُعدّ صعوداً بدل أن يظهر دفعة. السنة لا تبدأ من الصفر بل من
// قريب (1936 → 1960)، والشكل الذي لا يُفهم بأمان يُعرض ثابتاً كما كان.
export default function HeroNum({ num, color }) {
  const fmt = useNum();
  const parsed = parseHero(num);
  const target = parsed ? parsed.value : 0;
  const from = parsed?.year ? Math.max(0, target - 24) : 0;
  const current = useCountUp(target, { from, duration: parsed?.year ? 500 : 700 });
  const text = parsed ? formatHero(parsed, current) : String(num ?? "");
  return (
    <div style={{ fontFamily: MONO, fontSize: "5.2em", fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
      {fmt(text)}
    </div>
  );
}
