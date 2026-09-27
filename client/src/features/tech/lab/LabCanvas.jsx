import { useRef } from "react";
import { Monitor, Smartphone, Server, Network, Router, Cloud, Power } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { KINDS, label } from "./lab.logic";

const ICON = { pc: Monitor, phone: Smartphone, server: Server, switch: Network, router: Router, internet: Cloud };
const W = 100, H = 75, DRAG = 6;

// لوحة المختبر: روابط ورزمة في SVG تحتها، وأجهزة كأزرار HTML فوقها تُنقل بالسحب وتُختار بالنقر.
export default function LabCanvas({ state, selected, packet, hue, onTap, onMove }) {
  const box = useRef(null);
  const reduced = useReducedMotion();
  const pos = Object.fromEntries(state.devices.map((d) => [d.id, d]));
  const P = (id) => `${(pos[id].x * W) / 100} ${(pos[id].y * H) / 100}`;
  const inPath = (a, b) => packet?.path && packet.path.some((id, i) => (id === a && packet.path[i + 1] === b) || (id === b && packet.path[i + 1] === a));

  // السحب بمستمعي النافذة: التقاط المؤشر يسرق النقرة من الزر
  const down = (id) => (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const start = { x: e.clientX, y: e.clientY }; let moved = false;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < DRAG) return;
      moved = true; const r = box.current.getBoundingClientRect();
      onMove(id, Math.max(6, Math.min(94, ((ev.clientX - r.left) / r.width) * 100)), Math.max(8, Math.min(92, ((ev.clientY - r.top) / r.height) * 100)));
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); if (!moved) onTap(id); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  return (
    <div ref={box} style={{ position: "relative", aspectRatio: `${W} / ${H}`, background: `radial-gradient(ellipse at 50% 30%, ${alpha(hue, 0.08)}, transparent 60%), ${C.surface}`, border: `1px dashed ${C.line}`, borderRadius: R.x2, overflow: "hidden", touchAction: "none", userSelect: "none" }}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {state.links.map(([a, b]) => { const hot = inPath(a, b); const dead = !pos[a].on || !pos[b].on; return <line key={`${a}-${b}`} x1={P(a).split(" ")[0]} y1={P(a).split(" ")[1]} x2={P(b).split(" ")[0]} y2={P(b).split(" ")[1]} vectorEffect="non-scaling-stroke" strokeWidth={hot ? 3 : 2} strokeLinecap="round" strokeDasharray={dead ? "2 4" : undefined} style={{ stroke: hot ? hue : dead ? C.red : alpha(C.text, 0.35), transition: "stroke .2s" }} />; })}
        {packet?.path && (reduced
          ? <circle r={1.3} cx={P(packet.path.at(-1)).split(" ")[0]} cy={P(packet.path.at(-1)).split(" ")[1]} style={{ fill: packet.ok ? C.green : C.red }} />
          : <circle key={packet.key} r={1.3} style={{ fill: packet.ok ? C.green : C.red }}><animateMotion dur={`${0.7 * (packet.path.length - 1)}s`} fill="freeze" path={`M ${packet.path.map(P).join(" L ")}`} /></circle>)}
      </svg>
      {state.devices.map((d) => { const Icon = ICON[d.kind]; const sel = selected.includes(d.id); return (
        <button key={d.id} type="button" onPointerDown={down(d.id)} onClick={(e) => { if (e.detail === 0) onTap(d.id); }} aria-pressed={sel} aria-label={`${label(d)}${d.ip ? ` ${d.ip}` : ""}${d.on ? "" : " مطفأ"}`}
          style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%, -50%)", display: "grid", justifyItems: "center", gap: S.xs, background: "transparent", border: 0, padding: 0, fontFamily: "inherit", cursor: "grab", touchAction: "none", opacity: d.on ? 1 : 0.55 }}>
          <span style={{ width: TAP, height: TAP, borderRadius: d.kind === "internet" ? R.pill : R.xl, background: sel ? hue : C.surface2, border: `2px solid ${sel ? hue : d.on ? C.line : C.red}`, display: "grid", placeItems: "center", boxShadow: sel ? `0 0 0 5px ${alpha(hue, 0.2)}` : "var(--shadow-1)", position: "relative" }}>
            <Icon size={22} color={sel ? C.bg : C.text} aria-hidden="true" />
            {!d.on && <Power size={12} color={C.red} aria-hidden="true" style={{ position: "absolute", top: -S.md, right: -S.md, background: C.surface, borderRadius: R.pill }} />}
          </span>
          <span style={{ fontSize: T.xs, fontWeight: 700, color: C.text, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: `0 ${S.md}px`, whiteSpace: "nowrap" }}>{KINDS[d.kind].label}</span>
          {d.ip && <span dir="ltr" className="madar-num" style={{ fontSize: T.xs, color: d.manual ? C.gold : C.muted, whiteSpace: "nowrap" }}>{d.ip}</span>}
        </button>
      ); })}
      {!state.devices.length && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: C.muted, fontSize: T.md, textAlign: "center", padding: S.x4 }}>اللوحة فارغة: أضف راوتراً وبعض الأجهزة من الشريط أدناه.</div>}
    </div>
  );
}
