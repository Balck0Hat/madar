import { C, R, S } from "../../constants/theme";

// الشريط الملوّن على الحافة البادئة لا على «اليمين»: في RTL هما نفس الجهة،
// لكن الفيزيائية تنقلب إلى الحافة الخاتمة لو غُيّر الاتجاه يوماً.
export default function Card({ children, style = {}, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "madar-lift madar-press" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } } : undefined}
      style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x4, borderInlineStartWidth: accent ? 3 : 1, borderInlineStartColor: accent || C.line, boxShadow: "var(--shadow-1)", cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}
