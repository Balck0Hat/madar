import { Award } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { BADGES } from "../../../shared/data/curriculum";
import { useNum } from "../../../shared/context/NumContext";

export default function BadgeGrid({ badges }) {
  const num = useNum();
  return (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>الأوسمة <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>{num(badges.length)}/{num(BADGES.length)}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BADGES.map((b) => {
          const got = badges.includes(b.id);
          return (
            <div key={b.id} style={{ background: got ? C.goldSoft : C.surface, border: `1px solid ${got ? C.gold : C.line}`, borderRadius: 14, padding: 12, opacity: got ? 1 : 0.6 }}>
              <Award size={18} color={got ? C.gold : C.muted} />
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 6 }}>{b.name}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2, lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
