import { C, MONO, alpha } from "../../constants/theme";
import { SHORTCUTS } from "../../hooks/useShortcuts";
import Btn from "./Btn";

// نافذة اختصارات لوحة المفاتيح (تُفتح بـ ؟) — تُعرض على الشاشات التي فيها لوحة مفاتيح
export default function ShortcutsHelp({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="اختصارات لوحة المفاتيح"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: alpha("#000", 0.6), backdropFilter: "blur(3px)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} className="madar-rise" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: 20, width: "100%", maxWidth: 380, boxShadow: "var(--shadow)" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 14 }}>اختصارات لوحة المفاتيح</div>
        <div style={{ display: "grid", gap: 8 }}>
          {SHORTCUTS.map(([key, label]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14 }}>{label}</span>
              <kbd style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "3px 9px", color: C.gold, whiteSpace: "nowrap" }}>{key}</kbd>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}><Btn onClick={onClose}>إغلاق</Btn></div>
      </div>
    </div>
  );
}
