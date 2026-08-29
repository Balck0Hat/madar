import { C, alpha } from "../../constants/theme";

export default function Pill({ children, color = C.gold }) {
  return (
    <span style={{ background: alpha(color, 0.13), color, border: `1px solid ${alpha(color, 0.33)}`, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
