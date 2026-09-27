import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Maximize2, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { link } from "./mapLayout";

const ZOOM = { min: 0.2, max: 2.2 };

// لوحة الخريطة الذهنية: حواف SVG وعقد HTML داخل سطح يُسحب بالإصبع/الماوس ويُقرَّب بالعجلة أو الأزرار.
// العقد الخافتة لا تطابق تصفية المستوى/المفضلة. المختارة تتوهّج.
export default function MindMap({ data, dimmed, selected, onSelect, height = 620 }) {
  const num = useNum();
  const box = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });
  const drag = useRef(null);
  const fit = () => { const el = box.current; if (!el) return; const z = Math.min(ZOOM.max, Math.max(ZOOM.min, Math.min(el.clientWidth / data.width, el.clientHeight / data.height) * 0.96)); setView({ x: el.clientWidth / 2, y: el.clientHeight / 2, z }); };
  const home = () => { const el = box.current; if (!el) return; setView({ x: el.clientWidth / 2, y: el.clientHeight / 2, z: 0.6 }); }; // بداية مقروءة حول المركز
  useEffect(() => { home(); }, [data.width, data.height]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selected || !box.current) return;
    const n = data.byId.get(selected); if (!n) return;
    setView((v) => ({ ...v, x: box.current.clientWidth / 2 - n.x * v.z, y: box.current.clientHeight / 2 - n.y * v.z }));
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const zoomBy = (f, cx, cy) => setView((v) => { const z = Math.min(ZOOM.max, Math.max(ZOOM.min, v.z * f)); const k = z / v.z; const px = cx ?? box.current.clientWidth / 2, py = cy ?? box.current.clientHeight / 2; return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k }; });
  const onWheel = (e) => { e.preventDefault(); const r = box.current.getBoundingClientRect(); zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top); };
  // السحب بمستمعات على النافذة لا بالتقاط المؤشر: الالتقاط كان يحوّل النقر عن أزرار العقد
  const down = (e) => {
    if (e.button && e.button !== 0) return;
    const d = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    drag.current = d;
    const move = (ev) => { const dx = ev.clientX - d.x, dy = ev.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy })); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setTimeout(() => { drag.current = null; }, 0); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const pick = (id) => { if (drag.current?.moved) return; onSelect(id); };

  return (
    <div ref={box} onWheel={onWheel} onPointerDown={down} role="application" aria-label="الخريطة الذهنية: اسحب للتحريك وقرّب بالعجلة"
      style={{ position: "relative", height, overflow: "hidden", borderRadius: R.x3, border: `1px solid ${C.line}`, background: `radial-gradient(ellipse at 50% 40%, ${alpha(C.gold, 0.08)}, transparent 60%), ${C.bg}`, cursor: drag.current ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transformOrigin: "0 0", willChange: "transform" }}>
        <svg aria-hidden="true" width={data.width} height={data.height} viewBox={`${-data.width / 2} ${-data.height / 2} ${data.width} ${data.height}`} style={{ position: "absolute", left: -data.width / 2, top: -data.height / 2, overflow: "visible" }}>
          {data.edges.map((e) => { const a = data.byId.get(e.from), b = data.byId.get(e.to); const on = selected && (e.to === selected || e.from === selected); return <path key={`${e.from}-${e.to}`} d={link(a, b)} fill="none" style={{ stroke: on ? e.hue : alpha(e.hue, 0.45) }} strokeWidth={a.kind === "center" ? 4 : a.kind === "branch" ? 2.5 : 1.5} strokeLinecap="round" />; })}
        </svg>
        {data.nodes.map((n) => <Node key={n.id} n={n} num={num} dim={dimmed(n)} selected={selected === n.id} onPick={pick} />)}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, bottom: S.x2, display: "flex", gap: S.sm, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: S.xs, border: `1px solid ${C.line}` }}>
        {[["تكبير", Plus, () => zoomBy(1.25)], ["تصغير", Minus, () => zoomBy(0.8)], ["ملاءمة", Maximize2, fit]].map(([label, Icon, fn]) => (
          <button key={label} type="button" aria-label={label} onClick={fn} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: 0, background: "transparent", color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon size={16} /></button>
        ))}
        <span className="madar-num" aria-live="polite" style={{ alignSelf: "center", fontSize: T.xs, color: C.muted, padding: `0 ${S.md}px` }}>{num(Math.round(view.z * 100))}٪</span>
      </div>
    </div>
  );
}

function Node({ n, num, dim, selected, onPick }) {
  const big = n.kind === "center" || n.kind === "branch";
  const base = { position: "absolute", left: n.x, top: n.y, transform: "translate(-50%, -50%)", opacity: dim ? 0.25 : 1, transition: "opacity .2s, transform .2s", whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit", direction: "rtl" };
  if (n.kind === "center") return (
    <div style={{ ...base, cursor: "default", width: 150, height: 150, borderRadius: R.pill, border: `4px solid ${C.gold}`, background: C.surface, display: "grid", placeItems: "center", textAlign: "center", boxShadow: `0 0 0 10px ${alpha(C.gold, 0.15)}, 0 12px 30px ${alpha("#000", 0.35)}` }}>
      <div><div style={{ fontWeight: 700, fontSize: T.lg, lineHeight: 1.3 }}>{n.title}</div><div dir="ltr" style={{ color: C.muted, fontSize: T.xs, fontFamily: "Georgia, serif" }}>{n.en}</div></div>
    </div>
  );
  if (n.kind === "branch" || n.kind === "group") return (
    <button type="button" onClick={() => onPick(n.id)} aria-label={`${n.title} · ${num(n.count)} موضوعاً`}
      style={{ ...base, minHeight: TAP, padding: big ? `${S.lg}px ${S.x4}px` : `${S.sm}px ${S.x2}px`, borderRadius: R.pill, border: `2px solid ${n.hue}`, background: big ? n.hue : alpha(n.hue, 0.18), color: big ? C.bg : C.text, fontWeight: 700, fontSize: big ? T.lg : T.sm, boxShadow: big ? `0 0 22px ${alpha(n.hue, 0.5)}` : undefined }}>
      {n.title}{big && <span dir="ltr" style={{ display: "block", fontWeight: 400, fontSize: T.xs, opacity: 0.85, fontFamily: "Georgia, serif" }}>{n.en}</span>}
    </button>
  );
  const mastered = n.mastery !== null && n.mastery >= 75;
  return (
    <button type="button" onClick={() => onPick(n.id)} aria-pressed={selected} aria-label={`${n.title}${n.level ? ` · ${n.level}` : ""}${n.marked ? " · في المفضلة" : ""}`}
      style={{ ...base, display: "inline-flex", alignItems: "center", gap: S.md, minHeight: TAP, padding: `${S.xs}px ${S.x2}px`, borderRadius: R.pill, border: `1.5px solid ${selected ? C.gold : alpha(n.hue, 0.7)}`, background: selected ? alpha(C.gold, 0.2) : C.surface, color: C.text, fontSize: T.sm, boxShadow: selected ? `0 0 0 4px ${alpha(C.gold, 0.25)}` : `0 2px 6px ${alpha("#000", 0.2)}`, transform: `translate(-50%, -50%)${selected ? " scale(1.08)" : ""}` }}>
      {mastered && <Check size={12} color={C.green} strokeWidth={3} aria-hidden="true" />}
      {n.marked && <Heart size={12} color={C.red} fill={C.red} aria-hidden="true" />}
      <span>{n.title}</span>
      {n.level && <span className="madar-num" style={{ fontSize: 10, color: C.muted }}>{n.level}</span>}
    </button>
  );
}
