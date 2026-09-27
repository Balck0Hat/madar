import { useEffect, useMemo, useRef } from "react";
import { Plus, Minus, Maximize2, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../../shared/constants/theme";
import { hueOf } from "../mapLayout";
import { SCENE, ISLANDS, CHIP, CLOUDS, LOD, chipPositions } from "./sceneLayout";
import { ensureSceneStyles } from "./sceneStyles";
import MiniMap from "./MiniMap";
import { useSceneCamera } from "./useSceneCamera";

const INK = "var(--scene-ink)";
const ART = "/maps/grammar"; // الأصول المرسومة (جزر، قلعة، جسور، غيوم) بخلفية شفافة
const CENTER_R = 190;
const CLOUD = ["large", "medium", "small"];

// عالم القواعد المرسوم: سماء ونجوم، غيوم تنجرف، القلعة في المركز وثماني جزر مرسومة بجسور بينها،
// ورقاقات القواعد بجانب كل جزيرة تظهر تدريجياً مع التقريب (جزر ← مجموعات ← قواعد).
// يُسحب ويُقرَّب بالعجلة أو بإصبعين، وله خريطة مصغّرة، وخطوط ذهبية تصل القاعدة المختارة بما يرتبط بها.
export default function SceneMap({ branches, dimmed, selected, related = [], onSelect, height = 720, total }) {
  const box = useRef(null);
  const cam = useSceneCamera(box);
  useEffect(() => { ensureSceneStyles(); }, []);
  const chips = useMemo(() => branches.flatMap((b) => (ISLANDS[b.id] ? chipPositions(b.id, b.groups).map((c) => ({ ...c, hue: hueOf(b.hue), island: b.id })) : [])), [branches]);
  const chipById = useMemo(() => new Map(chips.filter((c) => c.kind === "topic").map((c) => [c.id, c])), [chips]);
  useEffect(() => { const c = selected && chipById.get(selected); if (!c) return undefined; const t = setTimeout(() => cam.flyTo(c.x, c.y, Math.max(cam.view.z, 1)), 80); return () => clearTimeout(t); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const { view } = cam;
  const showGroups = view.z >= LOD.groups, showChips = view.z >= LOD.chips;
  const links = selected && chipById.get(selected) ? related.map((id) => chipById.get(id)).filter(Boolean).map((c) => ({ from: chipById.get(selected), to: c })) : [];
  // جسر مرسوم يُمدّ ويُدار من حافة القلعة إلى حافة الجزيرة
  const bridgeTo = (a) => { const dx = a.x - SCENE.cx, dy = a.y - SCENE.cy; const d = Math.hypot(dx, dy); const from = CENTER_R * 0.5, len = d - from - a.r * 0.55; return { len, ang: (Math.atan2(dy, dx) * 180) / Math.PI, x: SCENE.cx + (dx * from) / d, y: SCENE.cy + 20 + (dy * from) / d }; };

  return (
    <div ref={box} onWheel={cam.onWheel} onPointerDown={cam.onPointerDown} onTouchMove={cam.onTouchMove} onTouchEnd={cam.onTouchEnd} role="application" aria-label="عالم القواعد: اسحب للتحريك وقرّب بالعجلة"
      style={{ position: "relative", height, overflow: "hidden", borderRadius: R.x3, border: `1px solid ${C.line}`, background: "linear-gradient(180deg, var(--scene-sky) 0%, #16213f 45%, var(--scene-sea) 100%)", cursor: "grab", touchAction: "none", userSelect: "none", color: INK }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCENE.w, height: SCENE.h, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transformOrigin: "0 0", willChange: "transform", transition: cam.flying ? "transform .6s cubic-bezier(.2,.7,.3,1)" : "none" }}>
        <svg width={SCENE.w} height={SCENE.h} viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {Array.from({ length: 80 }, (_, i) => <circle key={i} cx={(i * 197) % SCENE.w} cy={(i * 131) % (SCENE.h * 0.75)} r={i % 4 ? 1.2 : 2} style={{ fill: "#fff" }} opacity={0.35 + (i % 3) * 0.2} className={i % 5 ? undefined : "scene-shimmer"} />)}
          <ellipse cx={SCENE.cx} cy={SCENE.h * 0.62} rx={SCENE.w * 0.55} ry={SCENE.h * 0.3} style={{ fill: alpha("#5eb4ff", 0.08) }} />
          {[0.5, 0.62, 0.74].map((k) => <path key={k} d={`M 0 ${SCENE.h * k} Q ${SCENE.w * 0.25} ${SCENE.h * k - 18} ${SCENE.w * 0.5} ${SCENE.h * k} T ${SCENE.w} ${SCENE.h * k}`} fill="none" style={{ stroke: "#9fd8ff" }} strokeWidth={2} opacity={0.18} className="scene-shimmer" />)}
          {CLOUDS.map(([cx, cy, k], i) => <image key={i} href={`${ART}/cloud-${CLOUD[i % 3]}.png`} x={cx} y={cy} width={170 * k} height={100 * k} opacity={0.85} className="scene-drift" style={{ animationDelay: `${-i * 6}s`, animationDuration: `${36 + i * 5}s` }} />)}
          {branches.map((b) => { const a = ISLANDS[b.id]; if (!a) return null; const g = bridgeTo(a); return <image key={`b-${b.id}`} href={`${ART}/bridge-curve.png`} x={g.x} y={g.y - 40} width={g.len} height={80} preserveAspectRatio="none" transform={`rotate(${g.ang} ${g.x} ${g.y})`} opacity={0.95} />; })}
          <g className="scene-float" style={{ animationDuration: "9s" }}><image href={`${ART}/center.png`} x={SCENE.cx - CENTER_R} y={SCENE.cy - CENTER_R - 20} width={CENTER_R * 2} height={CENTER_R * 2} /></g>
          {branches.map((b) => { const a = ISLANDS[b.id]; if (!a) return null; return <g key={b.id} className="scene-float" style={{ animationDelay: `${(a.x + a.y) % 7}s` }}><image href={`${ART}/${b.id}.png`} x={a.x - a.r} y={a.y - a.r} width={a.r * 2} height={a.r * 2} /></g>; })}
          {links.map((l) => <path key={l.to.id} d={`M ${l.from.x} ${l.from.y} Q ${(l.from.x + l.to.x) / 2} ${Math.min(l.from.y, l.to.y) - 80} ${l.to.x} ${l.to.y}`} fill="none" style={{ stroke: "#ffd37a" }} strokeWidth={3} strokeLinecap="round" className="scene-fall" opacity={0.9} />)}
          <image href={`${ART}/floating-islands.png`} x={SCENE.w - 250} y={SCENE.h * 0.44} width={200} height={92} opacity={0.6} className="scene-float" />
          <image href={`${ART}/floating-islands.png`} x={40} y={SCENE.h * 0.42} width={180} height={84} opacity={0.5} className="scene-float" style={{ animationDelay: "-3s" }} />
        </svg>
        <div style={{ position: "absolute", left: SCENE.cx, top: SCENE.cy + CENTER_R - 24, transform: "translate(-50%, 0)", width: 320, textAlign: "center", color: INK, direction: "rtl", textShadow: "0 2px 10px rgba(0,0,0,.7)", pointerEvents: "none" }}>
          <div style={{ fontWeight: 700, fontSize: 26, lineHeight: 1.15 }}>قواعد الإنجليزية</div>
          <div className="madar-num" style={{ fontSize: 12, opacity: 0.85 }}>{total} قاعدة</div>
        </div>
        {branches.map((b) => { const a = ISLANDS[b.id]; if (!a) return null; const hue = hueOf(b.hue); const count = b.groups.reduce((n, g) => n + g.topics.length, 0); return (
          <button key={`banner-${b.id}`} type="button" onClick={() => cam.pick(() => cam.flyTo(a.x, a.y, 1))} aria-label={`جزيرة ${b.title} · ${count} قاعدة`} className="scene-chip"
            style={{ position: "absolute", left: a.x, top: a.y + a.r * 0.98, transform: "translate(-50%, -50%)", minWidth: a.r * 1.3, minHeight: TAP, borderRadius: R.pill, border: `2px solid ${alpha("#fff", 0.35)}`, background: "rgba(20,24,44,.85)", color: INK, fontFamily: "inherit", fontWeight: 700, fontSize: 17, cursor: "pointer", boxShadow: `0 6px 18px ${alpha("#000", 0.45)}, 0 0 22px ${alpha(hue, 0.55)}`, direction: "rtl", lineHeight: 1.1, padding: `${S.sm}px ${S.x3}px` }}>
            {b.title}<span className="madar-num" style={{ display: "block", fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{count} قاعدة</span>
          </button>); })}
        {chips.map((c) => c.kind === "group" ? (
          <div key={`${c.island}-${c.id}`} style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, textAlign: "center", fontSize: showChips ? T.xs : T.base, fontWeight: 700, color: c.hue, textShadow: "0 1px 4px rgba(0,0,0,.8)", direction: "rtl", pointerEvents: "none", opacity: showGroups ? 1 : 0, transition: "opacity .25s, font-size .25s" }}>{c.title}</div>
        ) : (
          <button key={c.id} type="button" className="scene-chip" onClick={() => cam.pick(() => onSelect(c.id))} aria-pressed={selected === c.id} aria-label={`${c.title}${c.level ? ` · ${c.level}` : ""}`}
            style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, height: CHIP.h, borderRadius: R.pill, border: `1.5px solid ${selected === c.id ? C.gold : alpha(c.hue, 0.9)}`, background: selected === c.id ? C.gold : "rgba(20,24,44,.86)", color: selected === c.id ? "var(--scene-sky)" : INK, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.sm, cursor: "pointer", opacity: !showChips ? 0 : dimmed(c) ? 0.3 : 1, pointerEvents: showChips ? "auto" : "none", boxShadow: related.includes(c.id) ? `0 0 0 3px ${alpha(C.gold, 0.6)}, 0 3px 10px ${alpha("#000", 0.45)}` : `0 3px 10px ${alpha("#000", 0.45)}`, direction: "rtl", whiteSpace: "nowrap", overflow: "hidden", transition: "opacity .25s" }}>
            {c.mastery !== null && c.mastery >= 75 && <Check size={11} color="#3FB68B" strokeWidth={3} aria-hidden="true" />}{c.marked && <Heart size={11} color="#F26B5B" fill="#F26B5B" aria-hidden="true" />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>{c.level && <span className="madar-num" style={{ fontSize: 9, opacity: 0.75 }}>{c.level}</span>}
          </button>
        ))}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, top: S.x2, display: "grid", gap: S.xs, background: "rgba(20,24,44,.8)", borderRadius: R.pill, padding: S.xs, border: `1px solid ${alpha("#fff", 0.15)}` }}>
        {[["تكبير", Plus, () => cam.zoomBy(1.25)], ["تصغير", Minus, () => cam.zoomBy(0.8)], ["ملاءمة", Maximize2, cam.fit]].map(([label, Icon, fn]) => <button key={label} type="button" aria-label={label} onClick={fn} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: 0, background: "transparent", color: INK, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon size={18} /></button>)}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, bottom: S.x2 }}><MiniMap branches={branches} view={view} box={cam.size.w ? cam.size : null} onJump={cam.jump} /></div>
      <div style={{ position: "absolute", insetInlineStart: S.x2, bottom: S.x2, background: "rgba(20,24,44,.8)", border: `1px solid ${alpha("#fff", 0.15)}`, borderRadius: R.x2, padding: `${S.md}px ${S.x2}px`, fontSize: T.xs, color: INK, maxWidth: 260, lineHeight: 1.6 }}><b>استكشف العالم</b><br />{showChips ? "اضغط أي قاعدة لترى الصيغة والأمثلة والأخطاء؛ الخطوط الذهبية تصل القواعد المرتبطة." : showGroups ? "قرّب أكثر لتظهر القواعد داخل كل مجموعة." : "قرّب أو اضغط جزيرة لتطير إليها وتظهر مجموعاتها."}</div>
    </div>
  );
}
