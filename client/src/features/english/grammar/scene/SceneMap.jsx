import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, Maximize2, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../../shared/constants/theme";
import { hueOf } from "../mapLayout";
import { SCENE, ISLANDS, CHIP, CLOUDS, LOD, chipPositions, bridge } from "./sceneLayout";
import { ensureSceneStyles } from "./sceneStyles";
import IslandArt from "./IslandArt";
import CastleArt from "./CastleArt";
import MiniMap from "./MiniMap";

const ZOOM = { min: 0.3, max: 2.4 };
const INK = "var(--scene-ink)";

// عالم القواعد المرسوم: سماء ونجوم وغيوم تنجرف، بحر لامع، القلعة في المركز وثماني جزر بجسورها،
// ورقاقات القواعد بجانب كل جزيرة. يُسحب ويُقرَّب، وله خريطة مصغّرة. مع صورة مولَّدة في
// /maps/grammar-world.webp تُستبدل الجزر المرسومة بها وتبقى الرقاقات والعناوين في أماكنها.
export default function SceneMap({ branches, dimmed, selected, related = [], onSelect, height = 720, total }) {
  const box = useRef(null);
  const drag = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, z: 0.6 });
  const [flying, setFlying] = useState(false); // انتقال كاميرا ناعم (لا أثناء السحب)
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [art, setArt] = useState(false);
  useEffect(() => { ensureSceneStyles(); const img = new Image(); img.onload = () => setArt(true); img.src = "/maps/grammar-world.webp"; }, []);
  const fit = () => { const el = box.current; if (!el) return; const z = Math.max(ZOOM.min, Math.min(ZOOM.max, Math.min(el.clientWidth / SCENE.w, el.clientHeight / SCENE.h))); setSize({ w: el.clientWidth, h: el.clientHeight }); setView({ z, x: (el.clientWidth - SCENE.w * z) / 2, y: (el.clientHeight - SCENE.h * z) / 2 }); };
  useEffect(() => { fit(); const on = () => fit(); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // اللوح الجانبي يضيّق الخريطة: تابع حجمها الحي
    const el = box.current; if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); return () => ro.disconnect();
  }, []);
  const zoomBy = (f, cx, cy) => setView((v) => { const z = Math.min(ZOOM.max, Math.max(ZOOM.min, v.z * f)); const k = z / v.z; const px = cx ?? size.w / 2, py = cy ?? size.h / 2; return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k }; });
  const jump = (sx, sy) => setView((v) => ({ ...v, x: size.w / 2 - sx * v.z, y: size.h / 2 - sy * v.z }));
  const flyTo = (sx, sy, z) => { const el = box.current; const w = el?.clientWidth || size.w, h = el?.clientHeight || size.h; setFlying(true); setView({ z, x: w / 2 - sx * z, y: h / 2 - sy * z }); setTimeout(() => setFlying(false), 650); };
  const onWheel = (e) => { e.preventDefault(); const r = box.current.getBoundingClientRect(); zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top); };
  const down = (e) => {
    if (e.button && e.button !== 0) return;
    const d = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; drag.current = d;
    const move = (ev) => { const dx = ev.clientX - d.x, dy = ev.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy })); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setTimeout(() => { drag.current = null; }, 0); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const pick = (fn) => { if (!drag.current?.moved) fn(); };
  const pinch = useRef(null); // تقريب بإصبعين على اللمس
  const onTouchMove = (e) => {
    if (e.touches.length !== 2) { pinch.current = null; return; }
    e.preventDefault();
    const [a, b] = e.touches; const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const r = box.current.getBoundingClientRect(); const cx = (a.clientX + b.clientX) / 2 - r.left, cy = (a.clientY + b.clientY) / 2 - r.top;
    if (pinch.current) zoomBy(dist / pinch.current, cx, cy);
    pinch.current = dist;
  };
  const chips = useMemo(() => branches.flatMap((b) => (ISLANDS[b.id] ? chipPositions(b.id, b.groups).map((c) => ({ ...c, hue: hueOf(b.hue), island: b.id })) : [])), [branches]);
  const chipById = useMemo(() => new Map(chips.filter((c) => c.kind === "topic").map((c) => [c.id, c])), [chips]);
  useEffect(() => { const c = selected && chipById.get(selected); if (!c) return undefined; const t = setTimeout(() => flyTo(c.x, c.y, Math.max(view.z, 1)), 80); return () => clearTimeout(t); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const showGroups = view.z >= LOD.groups, showChips = view.z >= LOD.chips;
  const links = selected && chipById.get(selected) ? related.map((id) => chipById.get(id)).filter(Boolean).map((c) => ({ from: chipById.get(selected), to: c })) : [];
  return (
    <div ref={box} onWheel={onWheel} onPointerDown={down} onTouchMove={onTouchMove} onTouchEnd={() => { pinch.current = null; }} role="application" aria-label="عالم القواعد: اسحب للتحريك وقرّب بالعجلة"
      style={{ position: "relative", height, overflow: "hidden", borderRadius: R.x3, border: `1px solid ${C.line}`, background: "linear-gradient(180deg, var(--scene-sky) 0%, #16213f 45%, var(--scene-sea) 100%)", cursor: "grab", touchAction: "none", userSelect: "none", color: INK }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCENE.w, height: SCENE.h, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transformOrigin: "0 0", willChange: "transform", transition: flying ? "transform .6s cubic-bezier(.2,.7,.3,1)" : "none" }}>
        {art && <img src="/maps/grammar-world.webp" alt="" width={SCENE.w} height={SCENE.h} style={{ position: "absolute", inset: 0, display: "block" }} />}
        <svg width={SCENE.w} height={SCENE.h} viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {!art && Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 197) % SCENE.w} cy={(i * 131) % (SCENE.h * 0.7)} r={i % 4 ? 1.2 : 2} style={{ fill: "#fff" }} opacity={0.35 + (i % 3) * 0.2} className={i % 5 ? undefined : "scene-shimmer"} />)}
          {!art && <ellipse cx={SCENE.cx} cy={SCENE.h * 0.62} rx={SCENE.w * 0.55} ry={SCENE.h * 0.3} style={{ fill: alpha("#5eb4ff", 0.08) }} />}
          {!art && [0.5, 0.62, 0.74].map((k) => <path key={k} d={`M 0 ${SCENE.h * k} Q ${SCENE.w * 0.25} ${SCENE.h * k - 18} ${SCENE.w * 0.5} ${SCENE.h * k} T ${SCENE.w} ${SCENE.h * k}`} fill="none" style={{ stroke: "#9fd8ff" }} strokeWidth={2} opacity={0.18} className="scene-shimmer" />)}
          {!art && branches.map((b) => (ISLANDS[b.id] ? <path key={b.id} d={bridge(b.id)} fill="none" style={{ stroke: "#e8c988" }} strokeWidth={7} strokeLinecap="round" opacity={0.75} /> : null))}
          {!art && branches.map((b) => (ISLANDS[b.id] ? <path key={`d-${b.id}`} d={bridge(b.id)} fill="none" style={{ stroke: "#fff" }} strokeWidth={1.5} strokeDasharray="6 10" opacity={0.6} /> : null))}
          {!art && CLOUDS.map(([cx, cy, k], i) => <g key={i} className="scene-drift" style={{ animationDelay: `${-i * 6}s`, animationDuration: `${36 + i * 5}s` }} transform={`translate(${cx} ${cy}) scale(${k})`} opacity={0.75}><ellipse cx={0} cy={0} rx={70} ry={22} style={{ fill: "#fff" }} /><ellipse cx={45} cy={-12} rx={50} ry={26} style={{ fill: "#fff" }} /><ellipse cx={95} cy={4} rx={44} ry={18} style={{ fill: "#fff" }} /></g>)}
          {!art && <CastleArt x={SCENE.cx} y={SCENE.cy - 40} />}
          {!art && branches.map((b) => { const a = ISLANDS[b.id]; if (!a) return null; return <IslandArt key={b.id} x={a.x} y={a.y} r={a.r} Icon={a.icon} hue={hueOf(b.hue)} dim={false} />; })}
          {links.map((l) => <path key={l.to.id} d={`M ${l.from.x} ${l.from.y} Q ${(l.from.x + l.to.x) / 2} ${Math.min(l.from.y, l.to.y) - 80} ${l.to.x} ${l.to.y}`} fill="none" style={{ stroke: "#ffd37a" }} strokeWidth={3} strokeLinecap="round" className="scene-fall" opacity={0.9} />)}
          {!art && <g className="scene-sail" transform={`translate(${SCENE.cx - 60} ${SCENE.h * 0.7})`}><path d="M -18 10 L 18 10 L 10 20 L -10 20 Z" style={{ fill: "#8b5a2b" }} /><path d="M 0 -18 L 0 10 L 16 6 Z" style={{ fill: "#fff" }} /></g>}
        </svg>
        <div style={{ position: "absolute", left: SCENE.cx, top: SCENE.cy + 60, transform: "translate(-50%, 0)", width: 320, textAlign: "center", color: INK, direction: "rtl", textShadow: "0 2px 10px rgba(0,0,0,.7)", pointerEvents: "none" }}>
          <div style={{ fontWeight: 700, fontSize: 30, lineHeight: 1.15 }}>قواعد الإنجليزية</div>
          <div dir="ltr" style={{ fontFamily: "Georgia, serif", fontSize: 14, opacity: 0.85 }}>ENGLISH GRAMMAR · {total} rules</div>
        </div>
        {branches.map((b) => { const a = ISLANDS[b.id]; if (!a) return null; const hue = hueOf(b.hue); const count = b.groups.reduce((n, g) => n + g.topics.length, 0); return (
          <button key={`banner-${b.id}`} type="button" onClick={() => pick(() => flyTo(a.x, a.y, 1))} aria-label={`جزيرة ${b.title} · ${count} قاعدة`} className="scene-chip"
            style={{ position: "absolute", left: a.x, top: a.y - a.r * 0.42 + 54, transform: "translate(-50%, -50%)", width: a.r * 1.9, minHeight: TAP, borderRadius: R.pill, border: `2px solid ${alpha("#fff", 0.35)}`, background: "rgba(20,24,44,.85)", color: INK, fontFamily: "inherit", fontWeight: 700, fontSize: 18, cursor: "pointer", boxShadow: `0 6px 18px ${alpha("#000", 0.45)}, 0 0 22px ${alpha(hue, 0.55)}`, direction: "rtl", lineHeight: 1.1, padding: `${S.sm}px ${S.x2}px` }}>
            {b.title}<span dir="ltr" style={{ display: "block", fontSize: 11, fontWeight: 400, opacity: 0.8, fontFamily: "Georgia, serif" }}>{b.en}</span>
          </button>); })}
        {chips.map((c) => c.kind === "group" ? (
          <div key={`${c.island}-${c.id}`} style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, textAlign: "center", fontSize: showChips ? T.xs : T.base, fontWeight: 700, color: c.hue, textShadow: "0 1px 4px rgba(0,0,0,.8)", direction: "rtl", pointerEvents: "none", opacity: showGroups ? 1 : 0, transition: "opacity .25s, font-size .25s" }}>{c.title}</div>
        ) : (
          <button key={c.id} type="button" className="scene-chip" onClick={() => pick(() => onSelect(c.id))} aria-pressed={selected === c.id} aria-label={`${c.title}${c.level ? ` · ${c.level}` : ""}`}
            style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, height: CHIP.h, borderRadius: R.pill, border: `1.5px solid ${selected === c.id ? C.gold : alpha(c.hue, 0.9)}`, background: selected === c.id ? C.gold : "rgba(20,24,44,.86)", color: selected === c.id ? "var(--scene-sky)" : INK, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.sm, cursor: "pointer", opacity: !showChips ? 0 : dimmed(c) ? 0.3 : related.includes(c.id) ? 1 : 1, pointerEvents: showChips ? "auto" : "none", boxShadow: related.includes(c.id) ? `0 0 0 3px ${alpha(C.gold, 0.6)}, 0 3px 10px ${alpha("#000", 0.45)}` : `0 3px 10px ${alpha("#000", 0.45)}`, direction: "rtl", whiteSpace: "nowrap", overflow: "hidden", transition: "opacity .25s" }}>
            {c.mastery !== null && c.mastery >= 75 && <Check size={11} color="#3FB68B" strokeWidth={3} aria-hidden="true" />}{c.marked && <Heart size={11} color="#F26B5B" fill="#F26B5B" aria-hidden="true" />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>{c.level && <span className="madar-num" style={{ fontSize: 9, opacity: 0.75 }}>{c.level}</span>}
          </button>
        ))}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, top: S.x2, display: "grid", gap: S.xs, background: "rgba(20,24,44,.8)", borderRadius: R.pill, padding: S.xs, border: `1px solid ${alpha("#fff", 0.15)}` }}>
        {[["تكبير", Plus, () => zoomBy(1.25)], ["تصغير", Minus, () => zoomBy(0.8)], ["ملاءمة", Maximize2, fit]].map(([label, Icon, fn]) => <button key={label} type="button" aria-label={label} onClick={fn} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: 0, background: "transparent", color: INK, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon size={18} /></button>)}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, bottom: S.x2 }}><MiniMap branches={branches} view={view} box={size.w ? size : null} onJump={jump} /></div>
      <div style={{ position: "absolute", insetInlineStart: S.x2, bottom: S.x2, background: "rgba(20,24,44,.8)", border: `1px solid ${alpha("#fff", 0.15)}`, borderRadius: R.x2, padding: `${S.md}px ${S.x2}px`, fontSize: T.xs, color: INK, maxWidth: 260, lineHeight: 1.6 }}><b>استكشف العالم</b><br />{showChips ? "اضغط أي قاعدة لترى الصيغة والأمثلة والأخطاء؛ الخطوط الذهبية تصل القواعد المرتبطة." : showGroups ? "قرّب أكثر لتظهر القواعد داخل كل مجموعة." : "قرّب أو اضغط جزيرة لتطير إليها وتظهر مجموعاتها."}</div>
    </div>
  );
}
