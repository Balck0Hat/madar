import { C, alpha, R } from "../../constants/theme";

// أيقونات المجالات العشرة (viewBox 24×24، خطوط فقط)
export const ICON = {
  human: <g><circle cx="12" cy="7" r="4" /><path d="M4 21c0-5 4-8 8-8s8 3 8 8" /></g>,
  earth: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c4 4 4 14 0 18M12 3c-4 4-4 14 0 18" /></g>,
  history: <g><path d="M4 20h16M6 20v-9M10 20v-9M14 20v-9M18 20v-9M3 11h18L12 4z" /></g>,
  society: <g><circle cx="7" cy="9" r="3" /><circle cx="17" cy="9" r="3" /><path d="M2 20c0-4 2-6 5-6s5 2 5 6M12 20c0-4 2-6 5-6s5 2 5 6" /></g>,
  life: <g><path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16zM4 20l10-10" /></g>,
  arts: <g><path d="M12 3a9 9 0 1 0 0 18c2 0 2-2 1-3s0-3 2-3h2a4 4 0 0 0 4-4c0-5-4-8-9-8z" /><circle cx="8" cy="10" r="1.2" /><circle cx="12" cy="7" r="1.2" /><circle cx="16" cy="10" r="1.2" /></g>,
  religion: <g><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" /><path d="M12 12c1 2 2 3 2 5a2 2 0 0 1-4 0c0-2 1-3 2-5z" /></g>,
  tech: <g><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></g>,
  matter: <g><circle cx="12" cy="12" r="1.8" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" /></g>,
  tools: <g><circle cx="10" cy="10" r="6" /><path d="M14.5 14.5L21 21" /></g>,
};

export function Icon({ id, size = 18, color = C.text }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {ICON[id]}
    </svg>
  );
}

// شريط بنمط متكرر من أيقونة المجال (رأس صفحة المجال)
export function PatternBand({ id, color, height = 96, children }) {
  const pid = `pat-${id}`;
  return (
    <div style={{ position: "relative", height, borderRadius: R.x4, overflow: "hidden", background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.27)}` }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id={pid} width="44" height="44" patternUnits="userSpaceOnUse">
            <g transform="translate(10 10)" fill="none" stroke={color} strokeWidth="1.2" opacity="0.28">{ICON[id]}</g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
      </svg>
      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 16px" }}>{children}</div>
    </div>
  );
}
