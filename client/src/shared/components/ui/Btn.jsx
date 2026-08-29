import { C, P, FONT } from "../../constants/theme";

export default function Btn({ children, onClick, primary, color, full = true, small, disabled, ghost, paper, style: extra = {} }) {
  const base = {
    fontFamily: FONT, fontWeight: 700, borderRadius: 14, border: "1px solid",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
    width: full ? "100%" : "auto", padding: small ? "9px 14px" : "14px 18px", fontSize: small ? 14 : 16,
    minHeight: small ? 0 : 44,
  };
  const style = primary
    ? { ...base, background: color || C.gold, color: "#141B33", borderColor: "transparent" }
    : ghost
      ? { ...base, background: "transparent", color: paper ? P.muted : C.muted, borderColor: "transparent" }
      : paper
        ? { ...base, background: P.card, color: P.ink, borderColor: P.line }
        : { ...base, background: C.surface2, color: C.text, borderColor: C.line };
  return (
    <button type="button" disabled={disabled} onClick={disabled ? undefined : onClick} style={{ ...style, ...extra }}>
      {children}
    </button>
  );
}
