import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { useDesktop } from "../../../shared/hooks/useMedia";
import DiagramNode from "./DiagramNode";

const SPEED = 2600; // ملّي ثانية لكل خطوة في التشغيل التلقائي

// مشغّل رسم شبكي خطوة خطوة: عقد وروابط ثابتة، وفي كل خطوة تُضاء عقد وتتحرك رزم على روابطها
// ويُشرح ما يحدث تحت الرسم. تشغيل تلقائي أو خطوة خطوة؛ مع «تقليل الحركة» تصبح الرزم نقاطاً ثابتة.
// إحداثيات العقد نسب مئوية؛ الـSVG يأخذ نسبة اللوحة نفسها كي تبقى الدوائر دوائر.
export default function StepDiagram({ scene, hue = C.gold }) {
  const num = useNum();
  const reduced = useReducedMotion();
  const desktop = useDesktop();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = scene.steps[i];
  // على الهاتف اللوحة أطول والعقد أصغر كي لا تتراكب
  const H = desktop ? scene.h : Math.round(scene.h * 1.7);
  const pos = useMemo(() => Object.fromEntries(scene.nodes.map((n) => [n.id, { x: (n.x * scene.w) / 100, y: (n.y * H) / 100 }])), [scene, H]);
  useEffect(() => { setI(0); setPlaying(false); }, [scene.id]);
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setI((k) => (k + 1 < scene.steps.length ? k + 1 : (setPlaying(false), k))), SPEED);
    return () => clearTimeout(t);
  }, [playing, i, scene.steps.length]);
  const hot = new Set(step.hot || []);
  const linkHot = (a, b) => (step.packets || []).some((p) => (p.from === a && p.to === b) || (p.from === b && p.to === a));
  const controls = [["السابق", SkipBack, () => setI((k) => Math.max(0, k - 1)), i === 0], [playing ? "إيقاف" : "تشغيل", playing ? Pause : Play, () => setPlaying((p) => !p), false], ["التالي", SkipForward, () => setI((k) => Math.min(scene.steps.length - 1, k + 1)), i === scene.steps.length - 1], ["من البداية", RotateCcw, () => { setI(0); setPlaying(false); }, false]];

  return (
    <figure style={{ margin: 0, display: "grid", gap: S.lg }}>
      <div role="img" aria-label={`${scene.title}: ${step.caption}`} style={{ position: "relative", aspectRatio: `${scene.w} / ${H}`, background: `radial-gradient(ellipse at 50% 40%, ${alpha(hue, 0.08)}, transparent 65%), ${C.surface}`, border: `1px solid ${C.line}`, borderRadius: R.x2, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${scene.w} ${H}`} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {scene.links.map(([a, b]) => <line key={`${a}-${b}`} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} vectorEffect="non-scaling-stroke" style={{ stroke: linkHot(a, b) ? hue : alpha(C.text, 0.25), transition: "stroke .25s" }} strokeWidth={linkHot(a, b) ? 3 : 2} strokeDasharray={linkHot(a, b) ? undefined : "4 6"} strokeLinecap="round" />)}
          {(step.packets || []).map((p, k) => {
            const a = pos[p.from], b = pos[p.to]; const tone = p.tone === "bad" ? C.red : p.tone === "ok" ? C.green : hue;
            if (reduced) return <circle key={k} cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={1.4} style={{ fill: tone }} />;
            return (
              <g key={`${i}-${k}`}>
                <circle r={1.4} style={{ fill: tone }}><animateMotion dur={`${1.2 + k * 0.15}s`} begin={`${k * 0.25}s`} repeatCount="indefinite" path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} /></circle>
                {p.label && desktop && <text fontSize={2.2} textAnchor="middle" style={{ fill: tone, fontWeight: 700 }} x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 2.4}>{p.label}</text>}
              </g>
            );
          })}
        </svg>
        {scene.nodes.map((n) => <DiagramNode key={n.id} node={n} hue={hue} compact={!desktop} hot={hot.size ? hot.has(n.id) : undefined} />)}
      </div>
      <figcaption style={{ display: "grid", gap: S.md }}>
        <div aria-live="polite" style={{ minHeight: TAP, lineHeight: 1.8, background: alpha(hue, 0.08), borderInlineStart: `4px solid ${hue}`, borderRadius: R.lg, padding: `${S.md}px ${S.x2}px` }}>
          <span className="madar-num" style={{ color: C.muted, fontSize: T.xs }}>الخطوة {num(i + 1)} من {num(scene.steps.length)} · </span>{step.caption}
          {step.note && <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>{step.note}</div>}
        </div>
        <div style={{ display: "flex", gap: S.sm, alignItems: "center" }}>
          {controls.map(([lbl, Icon, fn, off]) => { const main = lbl === "تشغيل" || lbl === "إيقاف"; return (
            <button key={lbl} type="button" onClick={fn} disabled={off} aria-label={lbl} style={{ width: TAP, height: TAP, borderRadius: R.pill, border: `1px solid ${main ? hue : C.line}`, background: main ? hue : C.surface, color: main ? C.bg : C.text, display: "grid", placeItems: "center", cursor: off ? "default" : "pointer", opacity: off ? 0.4 : 1 }}><Icon size={18} /></button>
          ); })}
          <div style={{ flex: 1, display: "flex", gap: S.xs }} aria-hidden="true">{scene.steps.map((_, k) => <span key={k} onClick={() => setI(k)} style={{ flex: 1, height: S.sm, borderRadius: R.pill, background: k <= i ? hue : C.line, cursor: "pointer", transition: "background .2s" }} />)}</div>
        </div>
      </figcaption>
    </figure>
  );
}
