import { useState, useEffect, useRef } from "react";

const clamp = (v, lim) => Math.max(-lim, Math.min(lim, v));

// ميلان ثلاثي الأبعاد خفيف مع حركة الجهاز أو المؤشر
export function useTilt() {
  const [t, setT] = useState({ x: 0, y: 0 });
  const raf = useRef(null), latest = useRef({ x: 0, y: 0 });

  const push = (x, y) => {
    latest.current = { x, y };
    if (!raf.current) raf.current = requestAnimationFrame(() => { raf.current = null; setT(latest.current); });
  };

  useEffect(() => {
    const on = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const g = clamp(e.gamma, 25), b = clamp(e.beta - 40, 25);
      push((-b / 25) * 6, (g / 25) * 6);
    };
    window.addEventListener("deviceorientation", on);
    return () => { window.removeEventListener("deviceorientation", on); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  // iOS يتطلب إذناً صريحاً لحركة الجهاز؛ يُطلب عند أول لمسة
  const ask = () => {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") D.requestPermission().catch(() => push(0, 0));
  };

  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    push(-y * 7, x * 7);
  };
  const onPointerLeave = () => push(0, 0);

  return {
    style: { transform: `perspective(900px) rotateX(${t.x.toFixed(2)}deg) rotateY(${t.y.toFixed(2)}deg)`, transition: "transform .18s ease-out", willChange: "transform" },
    onPointerMove,
    onPointerLeave,
    onPointerDown: ask,
  };
}
