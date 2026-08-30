import { C, alpha, T, R } from "../../constants/theme";

export default function Pill({ children, color = C.gold }) {
  return (
    <span style={{ background: alpha(color, 0.13), color, border: `1px solid ${alpha(color, 0.33)}`, borderRadius: R.pill, padding: "3px 10px", fontSize: T.sm, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
