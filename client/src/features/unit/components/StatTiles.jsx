import { P, MONO, S, R } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// أرقام البطاقة كبيرة فوق نثرها — اللحظة التي يعطيها الرقم البطل في أول
// الوحدة، هنا للبطاقات التي تستحقها (ثلاثة أرقام فأكثر، وهي 5% من البطاقات
// فتبقى لحظة لا خلفية). القيم والتسميات مقتطعة من النصّ كما وردت.
export default function StatTiles({ tiles = [], color }) {
  const num = useNum();
  if (!tiles.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))`, gap: S.lg, margin: `0 0 ${S.x3}px` }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x2, padding: `${S.x2}px ${S.lg}px`, textAlign: "center", minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: "1.55em", fontWeight: 700, color: color || P.gold, lineHeight: 1.1, letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>{num(t.v)}</div>
          <div style={{ color: P.muted, fontSize: ".78em", marginTop: S.sm, lineHeight: 1.4 }}>{t.l}</div>
        </div>
      ))}
    </div>
  );
}
