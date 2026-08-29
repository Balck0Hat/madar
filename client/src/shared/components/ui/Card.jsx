import { C } from "../../constants/theme";

export default function Card({ children, style = {}, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "madar-lift madar-press" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } } : undefined}
      style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16, borderRightWidth: accent ? 3 : 1, borderRightColor: accent || C.line, cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}
