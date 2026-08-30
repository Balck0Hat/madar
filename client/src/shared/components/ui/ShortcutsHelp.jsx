import { C, MONO, alpha, T, R, S } from "../../constants/theme";
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
      style={{ position: "fixed", inset: 0, background: alpha("#000", 0.6), backdropFilter: "blur(3px)", zIndex: 60, display: "grid", placeItems: "center", padding: S.x5 }}
    >
      <div onClick={(e) => e.stopPropagation()} className="madar-rise" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x4, padding: S.x5, width: "100%", maxWidth: 380, boxShadow: "var(--shadow-3)" }}>
        <div style={{ fontWeight: 700, fontSize: T.x2, marginBottom: S.x3 }}>اختصارات لوحة المفاتيح</div>
        <div style={{ display: "grid", gap: S.lg }}>
          {SHORTCUTS.map(([key, label]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.x2 }}>
              <span style={{ fontSize: T.md }}>{label}</span>
              <kbd style={{ fontFamily: MONO, fontSize: T.sm, fontWeight: 600, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.sm, padding: `${S.xs}px ${S.lg}px`, color: C.gold, whiteSpace: "nowrap" }}>{key}</kbd>
            </div>
          ))}
        </div>
        <div style={{ marginTop: S.x4 }}><Btn onClick={onClose}>إغلاق</Btn></div>
      </div>
    </div>
  );
}
