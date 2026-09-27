import { useEffect, useRef, useState } from "react";
import { SCENE } from "./sceneLayout";

const ZOOM = { min: 0.3, max: 2.4 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// كاميرا المشهد على نظام إيماءات واحد بمؤشرات (Pointer Events): إصبع أو ماوس = سحب،
// إصبعان = تقريب حول منتصفهما مع تثبيت النقطة التي تحتهما، والانتقال بين الحالتين
// يعيد ضبط المرجع فلا يقفز العرض. بلا التقاط مؤشر (كي لا يُحوَّل النقر عن الأزرار).
// كذلك: عجلة، نقر مزدوج، لوحة مفاتيح، ملاءمة، قفز، طيران ناعم، وحدود تمنع ضياع العالم.
export function useSceneCamera(box) {
  const [view, setView] = useState({ x: 0, y: 0, z: 0.6 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [flying, setFlying] = useState(false);
  const viewRef = useRef(view); viewRef.current = view;
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const dims = () => { const el = box.current; return { w: el?.clientWidth || size.w, h: el?.clientHeight || size.h }; };
  const local = (p) => { const r = box.current?.getBoundingClientRect() || { left: 0, top: 0 }; return { x: p.x - r.left, y: p.y - r.top }; };
  const clampZ = (z) => Math.min(ZOOM.max, Math.max(ZOOM.min, z));
  // حدود السحب: يبقى ثلث العالم على الأقل داخل الإطار
  const clamp = (v) => { const { w, h } = dims(); if (!w) return v; const sw = SCENE.w * v.z, sh = SCENE.h * v.z; const minX = Math.min(w * 0.35 - sw, w - sw), maxX = Math.max(w * 0.65, 0); const minY = Math.min(h * 0.35 - sh, h - sh), maxY = Math.max(h * 0.65, 0); return { ...v, x: Math.min(maxX, Math.max(minX, v.x)), y: Math.min(maxY, Math.max(minY, v.y)) }; };
  const commit = (v) => { const c = clamp(v); viewRef.current = c; setView(c); };

  const fit = () => { const { w, h } = dims(); if (!w) return; const z = clampZ(Math.min(w / SCENE.w, h / SCENE.h)); setSize({ w, h }); commit({ z, x: (w - SCENE.w * z) / 2, y: (h - SCENE.h * z) / 2 }); };
  // تقريب حول نقطة (px,py) بإحداثيات الإطار: النقطة تبقى تحت المؤشر
  const zoomAt = (v, z, px, py) => { const k = z / v.z; return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k }; };
  const zoomBy = (f, cx, cy, smooth = false) => { if (smooth) { setFlying(true); setTimeout(() => setFlying(false), 400); } const { w, h } = dims(); const v = viewRef.current; commit(zoomAt(v, clampZ(v.z * f), cx ?? w / 2, cy ?? h / 2)); };
  const panBy = (dx, dy) => { const v = viewRef.current; commit({ ...v, x: v.x + dx, y: v.y + dy }); };
  const jump = (sx, sy) => { const { w, h } = dims(); const v = viewRef.current; commit({ ...v, x: w / 2 - sx * v.z, y: h / 2 - sy * v.z }); };
  const flyTo = (sx, sy, z) => { const { w, h } = dims(); setFlying(true); commit({ z, x: w / 2 - sx * z, y: h / 2 - sy * z }); setTimeout(() => setFlying(false), 650); };

  useEffect(() => { fit(); const on = () => fit(); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current; if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect();
  }, [box]);

  // بداية إيماءة (أو إعادة ضبطها حين يتغير عدد الأصابع): تلتقط الحالة الحالية مرجعاً
  const begin = () => {
    const pts = [...pointers.current.values()].map(local);
    const moved = gesture.current?.moved || false;
    if (pts.length === 1) gesture.current = { mode: "pan", p0: pts[0], v0: viewRef.current, moved };
    else if (pts.length >= 2) { const m = mid(pts[0], pts[1]); const v = viewRef.current; gesture.current = { mode: "pinch", d0: Math.max(1, dist(pts[0], pts[1])), s0: { x: (m.x - v.x) / v.z, y: (m.y - v.y) / v.z }, v0: v, moved: true }; }
    else gesture.current = null;
  };
  const onMove = (ev) => {
    if (!pointers.current.has(ev.pointerId)) return;
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const g = gesture.current; if (!g) return;
    const pts = [...pointers.current.values()].map(local);
    if (g.mode === "pan" && pts.length === 1) {
      const dx = pts[0].x - g.p0.x, dy = pts[0].y - g.p0.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) g.moved = true;
      commit({ ...g.v0, x: g.v0.x + dx, y: g.v0.y + dy });
    } else if (g.mode === "pinch" && pts.length >= 2) {
      const m = mid(pts[0], pts[1]); const z = clampZ(g.v0.z * (dist(pts[0], pts[1]) / g.d0));
      commit({ z, x: m.x - g.s0.x * z, y: m.y - g.s0.y * z }); // النقطة التي بدأت تحت الأصابع تبقى تحتها
    }
  };
  const onUp = (ev) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size === 0) { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onUp); setTimeout(() => { gesture.current = null; }, 0); }
    else begin();
  };
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (pointers.current.size === 0) { window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onUp); }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    begin();
  };
  const onWheel = (e) => { e.preventDefault(); const p = local({ x: e.clientX, y: e.clientY }); zoomBy(e.deltaY < 0 ? 1.08 : 0.93, p.x, p.y); };
  const onDoubleClick = (e) => { const p = local({ x: e.clientX, y: e.clientY }); zoomBy(e.shiftKey ? 0.6 : 1.6, p.x, p.y, true); };
  const onKeyDown = (e) => {
    const step = 80; const map = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (map[e.key]) { e.preventDefault(); panBy(...map[e.key]); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(1.25, undefined, undefined, true); }
    else if (e.key === "-") { e.preventDefault(); zoomBy(0.8, undefined, undefined, true); }
    else if (e.key === "0") { e.preventDefault(); fit(); }
  };
  const pick = (fn) => { if (!gesture.current?.moved) fn(); };

  return { view, size, flying, fit, zoomBy, panBy, jump, flyTo, pick, dims, onWheel, onDoubleClick, onKeyDown, onPointerDown };
}
