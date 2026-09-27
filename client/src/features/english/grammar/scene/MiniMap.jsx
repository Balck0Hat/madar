import { alpha } from "../../../../shared/constants/theme";
import { SCENE, ISLANDS } from "./sceneLayout";
import { hueOf } from "../mapLayout";

const W = 180, H = Math.round((W * SCENE.h) / SCENE.w);

// خريطة مصغّرة: الجزر نقاطاً بألوانها، ومستطيل ما يظهر الآن؛ الضغط ينقل العرض إلى ذلك الموضع
export default function MiniMap({ branches, view, box, onJump }) {
  const k = W / SCENE.w;
  const rect = box ? { x: -view.x / view.z * k, y: -view.y / view.z * k, w: (box.w / view.z) * k, h: (box.h / view.z) * k } : null;
  const jump = (e) => { const r = e.currentTarget.getBoundingClientRect(); onJump(((e.clientX - r.left) / W) * SCENE.w, ((e.clientY - r.top) / H) * SCENE.h); };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="خريطة مصغّرة" onPointerDown={jump} style={{ display: "block", borderRadius: 12, background: alpha("#0b1020", 0.9), border: `1px solid ${alpha("#fff", 0.15)}`, cursor: "crosshair" }}>
      {branches.map((b) => { const a = ISLANDS[b.id]; return a ? <circle key={b.id} cx={a.x * k} cy={a.y * k} r={a.r * k * 0.7} style={{ fill: hueOf(b.hue) }} opacity={0.85} /> : null; })}
      <circle cx={SCENE.cx * k} cy={SCENE.cy * k} r={9} style={{ fill: "#ffd37a" }} />
      {rect && <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="none" style={{ stroke: "#fff" }} strokeWidth={1.5} rx={2} />}
    </svg>
  );
}
