import { useMemo } from "react";
import { C } from "../../constants/theme";
import { hash } from "../../utils/text";

export default function Confetti({ color }) {
  const bits = useMemo(
    () => Array.from({ length: 42 }).map((_, i) => ({
      l: hash(i + 1) * 100, d: hash(i + 50) * 0.8, s: 5 + hash(i + 90) * 7,
      c: [C.gold, C.text, color || C.gold][i % 3], r: hash(i + 130) > 0.5 ? "50%" : "2px", dur: 2.2 + hash(i + 170) * 1.2,
    })),
    [color],
  );
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }}>
      {bits.map((b, i) => <span key={i} className="madar-conf" style={{ left: `${b.l}%`, width: b.s, height: b.s * 0.6, background: b.c, borderRadius: b.r, animationDelay: `${b.d}s`, animationDuration: `${b.dur}s`, opacity: 0.95 }} />)}
    </div>
  );
}
