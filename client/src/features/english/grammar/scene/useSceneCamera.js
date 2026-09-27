import { useEffect, useRef, useState } from "react";
import { SCENE } from "./sceneLayout";

const ZOOM = { min: 0.3, max: 2.4 };

// كاميرا المشهد: سحب بمستمعات على النافذة (لا التقاط مؤشر، فلا يُحوَّل النقر عن الأزرار)،
// تقريب بالعجلة وبإصبعين وبالأزرار، ملاءمة، قفز، وطيران ناعم إلى نقطة. تتابع حجم الحاوية الحي.
export function useSceneCamera(box) {
  const [view, setView] = useState({ x: 0, y: 0, z: 0.6 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [flying, setFlying] = useState(false);
  const drag = useRef(null);
  const pinch = useRef(null);
  const dims = () => { const el = box.current; return { w: el?.clientWidth || size.w, h: el?.clientHeight || size.h }; };

  const fit = () => { const { w, h } = dims(); if (!w) return; const z = Math.max(ZOOM.min, Math.min(ZOOM.max, Math.min(w / SCENE.w, h / SCENE.h))); setSize({ w, h }); setView({ z, x: (w - SCENE.w * z) / 2, y: (h - SCENE.h * z) / 2 }); };
  const zoomBy = (f, cx, cy) => setView((v) => { const { w, h } = dims(); const z = Math.min(ZOOM.max, Math.max(ZOOM.min, v.z * f)); const k = z / v.z; const px = cx ?? w / 2, py = cy ?? h / 2; return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k }; });
  const jump = (sx, sy) => setView((v) => { const { w, h } = dims(); return { ...v, x: w / 2 - sx * v.z, y: h / 2 - sy * v.z }; });
  const flyTo = (sx, sy, z) => { const { w, h } = dims(); setFlying(true); setView({ z, x: w / 2 - sx * z, y: h / 2 - sy * z }); setTimeout(() => setFlying(false), 650); };

  useEffect(() => { fit(); const on = () => fit(); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current; if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect();
  }, [box]);

  const onWheel = (e) => { e.preventDefault(); const r = box.current.getBoundingClientRect(); zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top); };
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    const d = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; drag.current = d;
    const move = (ev) => { const dx = ev.clientX - d.x, dy = ev.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy })); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setTimeout(() => { drag.current = null; }, 0); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const onTouchMove = (e) => {
    if (e.touches.length !== 2) { pinch.current = null; return; }
    e.preventDefault();
    const [a, b] = e.touches; const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const r = box.current.getBoundingClientRect(); const cx = (a.clientX + b.clientX) / 2 - r.left, cy = (a.clientY + b.clientY) / 2 - r.top;
    if (pinch.current) zoomBy(dist / pinch.current, cx, cy);
    pinch.current = dist;
  };
  const onTouchEnd = () => { pinch.current = null; };
  const pick = (fn) => { if (!drag.current?.moved) fn(); };

  return { view, size, flying, fit, zoomBy, jump, flyTo, pick, onWheel, onPointerDown, onTouchMove, onTouchEnd };
}
