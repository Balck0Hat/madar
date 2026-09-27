import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, Maximize2, Heart, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../../shared/constants/theme";
import { hueOf } from "../mapLayout";
import { SCENE, ISLANDS, CHIP, CLOUDS, DECOR, FRONT_CLOUDS, LOD, CENTER_R, chipPositions } from "./sceneLayout";
import { ensureSceneStyles } from "./sceneStyles";
import MiniMap from "./MiniMap";
import { useSceneCamera } from "./useSceneCamera";

const INK = "var(--scene-ink)";
const ART = "/maps/grammar"; // الأصول المرسومة بخلفية شفافة (قلعة، جزر، جسور، غيوم، صخور، ضباب، ماء، جبال)
const CLOUD = ["large", "medium", "small"];
// لافتة خشبية بحافة ذهبية كلافتات الجزر المرسومة
const PLAQUE = { background: "linear-gradient(180deg, #6b4423 0%, #3f2413 100%)", border: "2px solid #e0b25a", boxShadow: `0 3px 0 ${alpha("#2a170b", 1)}, 0 8px 18px ${alpha("#000", 0.5)}`, color: INK, textShadow: "0 1px 2px rgba(0,0,0,.8)" };

// عالم القواعد المرسوم: سماء وجبال وبحر من أصول اللوحة، القلعة في المركز وثماني جزر كبيرة بجسور
// بينها وصخور طافية وضباب وغيوم أمامية. رقاقات القواعد تظهر تدريجياً مع التقريب (جزر ← مجموعات ← قواعد).
export default function SceneMap({ branches, dimmed, selected, related = [], onSelect, height = 720, total }) {
  const box = useRef(null);
  const cam = useSceneCamera(box);
  const [help, setHelp] = useState(true);
  useEffect(() => { ensureSceneStyles(); }, []);
  const chips = useMemo(() => branches.flatMap((b) => (ISLANDS[b.id] ? chipPositions(b.id, b.groups).map((c) => ({ ...c, hue: hueOf(b.hue), island: b.id })) : [])), [branches]);
  const chipById = useMemo(() => new Map(chips.filter((c) => c.kind === "topic").map((c) => [c.id, c])), [chips]);
  const islands = useMemo(() => branches.filter((b) => ISLANDS[b.id]).map((b) => ({ ...b, a: ISLANDS[b.id] })).sort((p, q) => p.a.y - q.a.y), [branches]); // الأبعد أولاً ليغطيه الأقرب
  useEffect(() => { const c = selected && chipById.get(selected); if (!c) return undefined; const t = setTimeout(() => cam.flyTo(c.x, c.y, Math.max(cam.view.z, 1)), 80); return () => clearTimeout(t); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const { view } = cam;
  const showGroups = view.z >= LOD.groups, showChips = view.z >= LOD.chips;
  const links = selected && chipById.get(selected) ? related.map((id) => chipById.get(id)).filter(Boolean).map((c) => ({ from: chipById.get(selected), to: c })) : [];
  // الطيران إلى جزيرة: تقريب يُظهرها مع أعمدة قواعدها، والمركز مائل نحو جهة القواعد
  const flyToIsland = (a) => { const { w } = cam.dims(); const z = Math.min(1.3, Math.max(0.95, w / 1050)); const dir = a.side === "right" ? 1 : a.side === "left" ? -1 : 0; cam.flyTo(a.x + dir * 200, a.y + (a.side === "bottom" ? 120 : 0), z); };
  // جسر بحجمه الطبيعي في منتصف المسافة بين القلعة والجزيرة، مُدار نحوها
  const bridgeTo = (a) => { const dx = a.x - SCENE.cx, dy = a.y - SCENE.cy; const d = Math.hypot(dx, dy); const t0 = (CENTER_R * 0.62) / d, t1 = 1 - (a.r * 0.62) / d; const mx = SCENE.cx + dx * ((t0 + t1) / 2), my = SCENE.cy + 30 + dy * ((t0 + t1) / 2); const w = Math.max(200, d * (t1 - t0) * 1.15); return { x: mx, y: my, w, h: w * 0.49, ang: (Math.atan2(dy, dx) * 180) / Math.PI }; };

  return (
    <div ref={box} tabIndex={0} onWheel={cam.onWheel} onDoubleClick={cam.onDoubleClick} onKeyDown={cam.onKeyDown} onPointerDown={cam.onPointerDown} onTouchMove={cam.onTouchMove} onTouchEnd={cam.onTouchEnd} role="application" aria-label="عالم القواعد: اسحب للتحريك، قرّب بالعجلة أو بالنقر المزدوج، والأسهم للتنقل"
      style={{ position: "relative", height, overflow: "hidden", borderRadius: R.x3, border: `1px solid ${C.line}`, background: "linear-gradient(180deg, #0d1a3a 0%, #1d3a7a 55%, #0f4c8a 100%)", cursor: "grab", touchAction: "none", userSelect: "none", color: INK }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCENE.w, height: SCENE.h, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transformOrigin: "0 0", willChange: "transform", transition: cam.flying ? "transform .6s cubic-bezier(.2,.7,.3,1)" : "none" }}>
        <svg width={SCENE.w} height={SCENE.h} viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <image href={`${ART}/sky.png`} x={-SCENE.w * 0.15} y={-SCENE.h * 0.15} width={SCENE.w * 1.3} height={SCENE.h * 1.3} preserveAspectRatio="xMidYMid slice" opacity={0.9} style={{ filter: "blur(6px) saturate(1.1)" }} />
          <radialGradient id="scene-glow" cx="50%" cy="48%" r="45%"><stop offset="0" stopColor="#ffd37a" stopOpacity="0.32" /><stop offset="1" stopColor="#ffd37a" stopOpacity="0" /></radialGradient>
          <rect x={0} y={0} width={SCENE.w} height={SCENE.h} fill="url(#scene-glow)" />
          {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 197) % SCENE.w} cy={(i * 131) % (SCENE.h * 0.45)} r={i % 4 ? 1.2 : 2} style={{ fill: "#fff" }} opacity={0.3 + (i % 3) * 0.2} className={i % 5 ? undefined : "scene-shimmer"} />)}
          {[0, 1, 2].map((i) => <image key={`m-${i}`} href={`${ART}/mountains.png`} x={-100 + i * 640} y={SCENE.h * 0.5 - 40} width={700} height={260} opacity={0.35} />)}
          {[0, 1, 2, 3].map((i) => <image key={`w-${i}`} href={`${ART}/water-surface.png`} x={i * 470 - 60} y={SCENE.h - 150} width={520} height={240} opacity={0.5} className="scene-shimmer" />)}
          {CLOUDS.map(([cx, cy, k], i) => <image key={`c-${i}`} href={`${ART}/cloud-${CLOUD[i % 3]}.png`} x={cx} y={cy} width={200 * k} height={120 * k} opacity={0.75} className="scene-drift" style={{ animationDelay: `${-i * 6}s`, animationDuration: `${36 + i * 5}s` }} />)}
          {DECOR.map(([name, x, y, w, o], i) => <image key={`d-${i}`} href={`${ART}/${name}.png`} x={x} y={y} width={w} height={w} preserveAspectRatio="xMidYMid meet" opacity={o} className="scene-float" style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${7 + (i % 3)}s` }} />)}
          {islands.map((b) => { const g = bridgeTo(b.a); return <image key={`b-${b.id}`} href={`${ART}/bridge.png`} x={g.x - g.w / 2} y={g.y - g.h / 2} width={g.w} height={g.h} preserveAspectRatio="none" transform={`rotate(${g.ang} ${g.x} ${g.y})`} />; })}
          {islands.filter((b) => b.a.y < SCENE.cy).map((b) => <g key={b.id} className="scene-float" style={{ animationDelay: `${(b.a.x + b.a.y) % 7}s` }}><image href={`${ART}/${b.id}.png`} x={b.a.x - b.a.r} y={b.a.y - b.a.r} width={b.a.r * 2} height={b.a.r * 2} /></g>)}
          <g className="scene-float" style={{ animationDuration: "9s" }}><image href={`${ART}/center.png`} x={SCENE.cx - CENTER_R} y={SCENE.cy - CENTER_R - 10} width={CENTER_R * 2} height={CENTER_R * 2} /></g>
          {islands.filter((b) => b.a.y >= SCENE.cy).map((b) => <g key={b.id} className="scene-float" style={{ animationDelay: `${(b.a.x + b.a.y) % 7}s` }}><image href={`${ART}/${b.id}.png`} x={b.a.x - b.a.r} y={b.a.y - b.a.r} width={b.a.r * 2} height={b.a.r * 2} /></g>)}
          {links.map((l) => <path key={l.to.id} d={`M ${l.from.x} ${l.from.y} Q ${(l.from.x + l.to.x) / 2} ${Math.min(l.from.y, l.to.y) - 80} ${l.to.x} ${l.to.y}`} fill="none" style={{ stroke: "#ffd37a" }} strokeWidth={3} strokeLinecap="round" className="scene-fall" opacity={0.9} />)}
          {FRONT_CLOUDS.map(([name, x, y, w, o], i) => <image key={`f-${i}`} href={`${ART}/${name}.png`} x={x} y={y} width={w} height={w * 0.55} opacity={o} className="scene-drift" style={{ animationDelay: `${-i * 9}s`, animationDuration: `${50 + i * 7}s` }} />)}
        </svg>
        <div style={{ position: "absolute", left: SCENE.cx, top: SCENE.cy + CENTER_R - 34, transform: "translate(-50%, 0)", ...PLAQUE, borderRadius: R.lg, padding: `${S.sm}px ${S.x4}px`, textAlign: "center", direction: "rtl", pointerEvents: "none", whiteSpace: "nowrap" }}>
          <div style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>قواعد الإنجليزية</div>
          <div className="madar-num" style={{ fontSize: 11, opacity: 0.85 }}>{total} قاعدة</div>
        </div>
        {islands.map((b) => { const hue = hueOf(b.hue); const count = b.groups.reduce((n, g) => n + g.topics.length, 0); return (
          <button key={`banner-${b.id}`} type="button" onClick={() => cam.pick(() => flyToIsland(b.a))} aria-label={`جزيرة ${b.title} · ${count} قاعدة`} className="scene-chip"
            style={{ position: "absolute", left: b.a.x, top: b.a.y + b.a.r * 0.86, transform: "translate(-50%, -50%)", minWidth: 150, minHeight: TAP, ...PLAQUE, boxShadow: `${PLAQUE.boxShadow}, 0 0 26px ${alpha(hue, 0.5)}`, borderRadius: R.lg, fontFamily: "inherit", fontWeight: 700, fontSize: 17, cursor: "pointer", direction: "rtl", lineHeight: 1.1, padding: `${S.sm}px ${S.x3}px` }}>
            {b.title}<span className="madar-num" style={{ display: "block", fontSize: 11, fontWeight: 400, opacity: 0.85 }}>{count} قاعدة</span>
          </button>); })}
        {chips.map((c) => c.kind === "group" ? (
          <div key={`${c.island}-${c.id}`} style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, textAlign: "center", fontSize: showChips ? T.xs : T.base, fontWeight: 700, color: INK, textShadow: "0 1px 4px rgba(0,0,0,.9)", direction: "rtl", pointerEvents: "none", opacity: showGroups ? 1 : 0, transition: "opacity .25s, font-size .25s" }}>{c.title}</div>
        ) : (
          <button key={c.id} type="button" className="scene-chip" onClick={() => cam.pick(() => onSelect(c.id))} aria-pressed={selected === c.id} aria-label={`${c.title}${c.level ? ` · ${c.level}` : ""}`}
            style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%, -50%)", width: CHIP.w, height: CHIP.h, borderRadius: R.md, ...PLAQUE, border: `1.5px solid ${selected === c.id ? C.gold : related.includes(c.id) ? "#ffd37a" : alpha(c.hue, 0.9)}`, background: selected === c.id ? "linear-gradient(180deg, #f2b544, #b8811c)" : PLAQUE.background, color: selected === c.id ? "var(--scene-sky)" : INK, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.sm, cursor: "pointer", opacity: !showChips ? 0 : dimmed(c) ? 0.3 : 1, pointerEvents: showChips ? "auto" : "none", direction: "rtl", whiteSpace: "nowrap", overflow: "hidden", transition: "opacity .25s" }}>
            {c.mastery !== null && c.mastery >= 75 && <Check size={11} color="#3FB68B" strokeWidth={3} aria-hidden="true" />}{c.marked && <Heart size={11} color="#F26B5B" fill="#F26B5B" aria-hidden="true" />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>{c.level && <span className="madar-num" style={{ fontSize: 9, opacity: 0.8 }}>{c.level}</span>}
          </button>
        ))}
      </div>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `inset 0 0 120px ${alpha("#000", 0.55)}` }} />
      <div role="group" aria-label="انتقل إلى جزيرة" style={{ position: "absolute", insetInlineStart: S.x2, top: S.x2, insetInlineEnd: 76, display: "flex", gap: S.sm, overflowX: "auto", padding: S.xs, scrollbarWidth: "none" }} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" onClick={cam.fit} style={{ flexShrink: 0, minHeight: TAP, padding: `0 ${S.x2}px`, ...PLAQUE, borderRadius: R.pill, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer" }}>الكل</button>
        {islands.map((b) => <button key={`jump-${b.id}`} type="button" onClick={() => flyToIsland(b.a)} style={{ flexShrink: 0, minHeight: TAP, padding: `0 ${S.x2}px`, ...PLAQUE, border: `2px solid ${alpha(hueOf(b.hue), 0.9)}`, borderRadius: R.pill, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer" }}>{b.title}</button>)}
      </div>
      <div style={{ position: "absolute", insetInlineEnd: S.x2, top: S.x2, display: "grid", gap: S.xs, background: "rgba(20,24,44,.8)", borderRadius: R.pill, padding: S.xs, border: `1px solid ${alpha("#fff", 0.15)}` }}>
        {[["تكبير", Plus, () => cam.zoomBy(1.25)], ["تصغير", Minus, () => cam.zoomBy(0.8)], ["ملاءمة", Maximize2, cam.fit]].map(([label, Icon, fn]) => <button key={label} type="button" aria-label={label} onClick={fn} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: 0, background: "transparent", color: INK, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon size={18} /></button>)}
      </div>
      {cam.size.w >= 640 && <div style={{ position: "absolute", insetInlineEnd: S.x2, bottom: S.x2 }}><MiniMap branches={branches} view={view} box={cam.size.w ? cam.size : null} onJump={cam.jump} /></div>}
      {help && (
        <div role="status" style={{ position: "absolute", insetInlineStart: S.x2, bottom: S.x2, display: "flex", alignItems: "center", gap: S.md, background: "rgba(20,24,44,.85)", border: `1px solid ${alpha("#fff", 0.15)}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xs}px ${S.xs}px ${S.x2}px`, fontSize: T.xs, color: INK, maxWidth: 420, lineHeight: 1.5 }}>
          <span>{showChips ? "اضغط قاعدة لترى تفاصيلها؛ الخطوط الذهبية تصل ما يرتبط بها." : showGroups ? "قرّب أكثر لتظهر القواعد." : "اضغط جزيرة أو اسمها فوق لتطير إليها · عجلة أو نقر مزدوج للتقريب."}</span>
          <button type="button" onClick={() => setHelp(false)} aria-label="إخفاء التلميح" style={{ width: TAP - 12, height: TAP - 12, borderRadius: R.pill, border: 0, background: alpha("#fff", 0.12), color: INK, cursor: "pointer", flexShrink: 0 }}>×</button>
        </div>
      )}
    </div>
  );
}
