import { useState, useEffect, useRef } from "react";
import { C, alpha } from "../../constants/theme";
import { starPos } from "./geometry";

const DUR = 900;

// تقليل الحركة يُفحص هنا لأن الحركة مقودة من JS (أصناف madar-* وحدها لا تكفي)
const reduced = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (err) { return false; }
};

// نجمة الوحدة الجديدة تنطلق من مركز العجلة إلى موضعها النهائي ثم تهبط بوميض.
// تُصيَّر فوق <Wheel> بنفس الـ viewBox ونفس الدوران فتتطابق الإحداثيات تماماً،
// والطبقتان بمنحنيَي تسارع مختلفين (أفقي/رأسي) تصنعان قوساً لطيفاً بدل خط مستقيم.
export default function StarFlight({ unitId, size, rotate = 0, color = C.gold, onLand }) {
  const [x, y] = starPos(unitId);
  const [go, setGo] = useState(false);
  const [burst, setBurst] = useState(false);
  const land = useRef(onLand);
  land.current = onLand;
  const still = reduced();

  useEffect(() => {
    // مع تقليل الحركة: نقفز إلى الحالة النهائية فوراً بلا انتقال
    if (still) { setGo(true); setBurst(true); if (land.current) land.current(); return undefined; }
    const timers = [
      setTimeout(() => setGo(true), 30), // إطار أول كي ينطلق الانتقال من المركز
      setTimeout(() => { setBurst(true); if (land.current) land.current(); }, DUR + 30),
    ];
    return () => timers.forEach(clearTimeout);
  }, [unitId, still]);

  const glide = (curve) => (still ? "none" : `transform ${DUR}ms ${curve}`);
  return (
    <svg
      viewBox="-26 -26 412 412"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, margin: "auto", width: size, height: size, pointerEvents: "none", overflow: "visible", transform: `rotate(${rotate}deg)` }}
    >
      <defs>
        <filter id="starflight-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g style={{ transform: `translateX(${go ? x - 180 : 0}px)`, transition: glide("cubic-bezier(.2,.75,.3,1)") }}>
        <g style={{ transform: `translateY(${go ? y - 180 : 0}px)`, transition: glide("cubic-bezier(.5,.05,.25,1)") }}>
          <circle cx="180" cy="180" r="10" fill={alpha(color, 0.28)} />
          <circle cx="180" cy="180" r="3.6" fill={color} filter="url(#starflight-glow)" />
          <circle
            cx="180" cy="180" r="6" fill="none" stroke={color} strokeWidth="1.8"
            style={{
              transformBox: "fill-box", transformOrigin: "center",
              transform: `scale(${burst ? 3 : 0.4})`, opacity: burst ? 0 : 0.85,
              transition: still ? "none" : "transform .45s ease-out, opacity .45s ease-out",
            }}
          />
        </g>
      </g>
    </svg>
  );
}
