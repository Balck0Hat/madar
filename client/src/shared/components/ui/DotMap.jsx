import { C, P, R, S, alpha } from "../../constants/theme";

// خريطة نقاط على صورة ثابتة بإسقاط مستطيل بسيط: الموضع يُحسب خطياً من خط
// الطول والعرض. ثلاث خرائط مقصوصة من الأصل نفسه، وتُختار أضيق واحدة تتسع
// لكل النقاط، فخريطة الدول العربية لا تضيع في خريطة العالم.
const MAPS = [
  { src: "/maps/arab-world.png", w: 1000, h: 659, lonMin: -20, lonMax: 62, latMin: -14, latMax: 40 },
  { src: "/maps/old-world.png", w: 1000, h: 435, lonMin: -25, lonMax: 145, latMin: -12, latMax: 62 },
  { src: "/maps/world.png", w: 1200, h: 473, lonMin: -180, lonMax: 180, latMin: -58, latMax: 84 },
];

const fits = (m, p) => p.lon >= m.lonMin && p.lon <= m.lonMax && p.lat >= m.latMin && p.lat <= m.latMax;
export const pickMap = (points) => MAPS.find((m) => points.every((p) => fits(m, p))) || MAPS[MAPS.length - 1];

// سطح القراءة (الورق) له ألوانه، وشاشات التطبيق لها ألوانها
const PALETTE = { paper: { line: P.line, bg: P.bg, ink: P.ink, muted: P.muted, gold: P.gold }, app: { line: C.line, bg: C.bg, ink: C.text, muted: C.muted, gold: C.gold } };

// points: [{ id, lat, lon, label, color, active }] — النشطة أكبر وتحمل اسمها
export default function DotMap({ points = [], onOpen, label = "خريطة", tint, surface = "paper" }) {
  const K = PALETTE[surface] || PALETTE.paper;
  tint ||= K.gold;
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  if (!valid.length) return null;
  const map = pickMap(valid);
  const pos = (p) => ({ left: `${((p.lon - map.lonMin) / (map.lonMax - map.lonMin)) * 100}%`, top: `${((map.latMax - p.lat) / (map.latMax - map.latMin)) * 100}%` });
  const ordered = [...valid].sort((a, b) => Number(Boolean(a.active)) - Number(Boolean(b.active))); // النشطة فوق

  return (
    <div role="group" aria-label={label}
      style={{ position: "relative", background: alpha(tint, 0.06), border: `1px solid ${K.line}`, borderRadius: R.x2, overflow: "hidden", aspectRatio: `${map.w} / ${map.h}` }}>
      <img src={map.src} alt="" width={map.w} height={map.h} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", opacity: 0.8 }} />
      {ordered.map((p) => {
        const size = p.active ? 12 : 9;
        return (
          <button key={p.id} type="button" title={p.label} aria-label={p.active ? p.label : `افتح ${p.label}`} onClick={() => !p.active && onOpen?.(p.id)}
            style={{ position: "absolute", ...pos(p), width: 24, height: 24, marginLeft: -12, marginTop: -12, padding: 0, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: onOpen && !p.active ? "pointer" : "default" }}>
            <span aria-hidden="true" style={{ display: "block", width: size, height: size, borderRadius: R.pill, background: p.color || K.muted, opacity: p.active ? 1 : 0.85, boxShadow: p.active ? `0 0 0 4px ${alpha(p.color || tint, 0.3)}` : `0 0 0 2px ${alpha(K.bg, 0.85)}` }} />
          </button>
        );
      })}
      {ordered.filter((p) => p.active && p.label).map((p) => (
        <span key={`l-${p.id}`} style={{ position: "absolute", ...pos(p), transform: "translate(-50%, 10px)", fontSize: ".72em", fontWeight: 700, color: K.ink, background: alpha(K.bg, 0.88), borderRadius: R.sm, padding: `${S.xs}px ${S.md}px`, whiteSpace: "nowrap", pointerEvents: "none" }}>{p.label}</span>
      ))}
    </div>
  );
}
