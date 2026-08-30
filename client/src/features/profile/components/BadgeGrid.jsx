import { Award } from "lucide-react";
import { C, T, R, S } from "../../../shared/constants/theme";
import { BADGES } from "../../../shared/data/curriculum";
import { useNum } from "../../../shared/context/NumContext";

export default function BadgeGrid({ badges }) {
  const num = useNum();
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: S.lg }}>الأوسمة <span style={{ color: C.muted, fontWeight: 400, fontSize: T.base }}>{num(badges.length)}/{num(BADGES.length)}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.lg }}>
        {BADGES.map((b) => {
          const got = badges.includes(b.id);
          return (
            <div key={b.id} style={{ background: got ? C.goldSoft : C.surface, border: `1px solid ${got ? C.gold : C.line}`, borderRadius: R.xl, padding: S.x2, opacity: got ? 1 : 0.6 }}>
              <Award size={18} color={got ? C.gold : C.muted} />
              <div style={{ fontWeight: 700, fontSize: T.md, marginTop: S.md }}>{b.name}</div>
              <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.xs, lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
