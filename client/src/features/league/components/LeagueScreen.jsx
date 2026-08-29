import { Zap } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { LEAGUE, LEAGUE_TIERS } from "../../../shared/data/curriculum";
import { useNum } from "../../../shared/context/NumContext";
import { Pill, TopBar } from "../../../shared/components/ui";

const CURRENT_TIER = 2; // الفضة
const PROMOTE = 7, RELEGATE = 5;

export default function LeagueScreen({ profile, weeklyXp }) {
  const num = useNum();
  const rows = [...LEAGUE.map(([n, x]) => ({ n, x, me: false })), { n: profile.name, x: weeklyXp, me: true }].sort((a, b) => b.x - a.x);
  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <TopBar title="دوري الفضة" right={<Pill>ينتهي الأحد</Pill>} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "4px 16px 12px" }}>
        {LEAGUE_TIERS.map((t, i) => <span key={t} style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999, background: i === CURRENT_TIER ? C.goldSoft : C.surface, color: i === CURRENT_TIER ? C.gold : C.muted, border: `1px solid ${i === CURRENT_TIER ? C.gold : C.line}` }}>{t}</span>)}
      </div>
      <div style={{ padding: "0 16px", color: C.muted, fontSize: 13, marginBottom: 10 }}>أعلى 7 يصعدون إلى الذهب، وأدنى 5 يهبطون إلى البرونز. النقاط تُحسب من الاثنين إلى الأحد.</div>
      <div style={{ padding: "0 16px", display: "grid", gap: 6 }}>
        {rows.map((r, k) => (
          <div key={r.n + k}>
            {k === PROMOTE && <div style={{ textAlign: "center", color: C.green, fontSize: 11, padding: "4px 0", borderTop: `1px dashed ${C.green}66` }}>فوق هذا الخط: صعود إلى الذهب</div>}
            {k === rows.length - RELEGATE && <div style={{ textAlign: "center", color: C.red, fontSize: 11, padding: "4px 0", borderTop: `1px dashed ${C.red}66` }}>تحت هذا الخط: هبوط إلى البرونز</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: r.me ? C.goldSoft : C.surface, border: `1px solid ${r.me ? C.gold : C.line}`, borderRadius: 14, padding: "10px 12px" }}>
              <span style={{ fontFamily: MONO, width: 22, color: k < 3 ? C.gold : C.muted, fontWeight: 800 }}>{num(k + 1)}</span>
              <span style={{ width: 30, height: 30, borderRadius: 99, background: r.me ? C.gold : C.surface2, color: r.me ? "#141B33" : C.text, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, border: k < 3 ? `2px solid ${C.gold}` : "none" }}>{r.n[0]}</span>
              <span style={{ flex: 1, fontWeight: r.me ? 800 : 600 }}>{r.n}{r.me && <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}> (أنت)</span>}</span>
              <span style={{ fontFamily: MONO, fontWeight: 800, color: C.gold, display: "flex", alignItems: "center", gap: 4 }}><Zap size={13} />{num(r.x)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
