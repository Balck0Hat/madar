import { C, alpha, T, R, S } from "../../constants/theme";

export default function Pill({ children, color = C.gold }) {
  return (
    <span style={{ background: alpha(color, 0.13), color, border: `1px solid ${alpha(color, 0.33)}`, borderRadius: R.pill, padding: `${S.xs}px ${S.xl}px`, fontSize: T.sm, fontWeight: 600, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
