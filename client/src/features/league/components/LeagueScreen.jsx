import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { C, MONO, alpha, T, R } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Pill, TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getStandings } from "../services/league.service";

const endsLabel = (d) => new Date(d).toLocaleDateString("ar", { weekday: "long" });

// الدوري الأسبوعي الحقيقي: كل من في طبقتك مرتبين بنقاط الأسبوع
export default function LeagueScreen() {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(getStandings, []);
  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <TopBar title={data ? `دوري ${data.tierName}` : "الدوري"} right={data && <Pill>ينتهي {endsLabel(data.weekEnd)}</Pill>} />
      {loading && <div style={{ padding: "0 16px" }}><Skeleton lines={6} /></div>}
      {error && <div style={{ padding: "0 16px" }}><ErrorState message={error.message} onRetry={reload} /></div>}
      {data && (
        <>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "4px 16px 12px" }}>
            {data.tiers.map((t, i) => <span key={t} style={{ flexShrink: 0, fontSize: T.xs, fontWeight: 700, padding: "5px 10px", borderRadius: R.pill, background: i === data.tier ? C.goldSoft : C.surface, color: i === data.tier ? C.gold : C.muted, border: `1px solid ${i === data.tier ? C.gold : C.line}` }}>{t}</span>)}
          </div>
          {data.lastLeague && data.lastLeague.outcome !== "stay" && (
            <div style={{ padding: "0 16px 10px" }}>
              <Card accent={data.lastLeague.outcome === "up" ? C.green : C.red}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>{data.lastLeague.outcome === "up" ? <TrendingUp size={16} color={C.green} /> : <TrendingDown size={16} color={C.red} />}{data.lastLeague.outcome === "up" ? "صعدت طبقة الأسبوع الماضي" : "هبطت طبقة الأسبوع الماضي"}</div>
                <div style={{ color: C.muted, fontSize: T.base, marginTop: 4 }}>ترتيبك كان {num(data.lastLeague.rank)} في دوري {data.tiers[data.lastLeague.tier]}.</div>
              </Card>
            </div>
          )}
          <div style={{ padding: "0 16px", color: C.muted, fontSize: T.base, marginBottom: 10 }}>
            {data.active ? `أعلى ${num(data.promote)} يصعدون، وأدنى ${num(data.relegate)} يهبطون. النقاط تُحسب من الاثنين إلى الأحد.` : `الصعود والهبوط يبدآن حين يبلغ الدوري ${num(data.minGroup)} متعلماً (الآن ${num(data.total)}).`}
          </div>
          {!data.rows.length && <EmptyState title="الدوري فارغ" text="كن أول من يسجّل نقاطاً هذا الأسبوع." />}
          <div style={{ padding: "0 16px", display: "grid", gap: 6 }}>
            {data.rows.map((r, k) => (
              <div key={r.id}>
                {data.active && k === data.promote && <div style={{ textAlign: "center", color: C.green, fontSize: T.xs, padding: "4px 0", borderTop: `1px dashed ${alpha(C.green, 0.4)}` }}>فوق هذا الخط: صعود</div>}
                {data.active && k === data.rows.length - data.relegate && k > data.promote && <div style={{ textAlign: "center", color: C.red, fontSize: T.xs, padding: "4px 0", borderTop: `1px dashed ${alpha(C.red, 0.4)}` }}>تحت هذا الخط: هبوط</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: r.me ? C.goldSoft : C.surface, border: `1px solid ${r.me ? C.gold : C.line}`, borderRadius: R.xl, padding: "10px 12px" }}>
                  <span style={{ fontFamily: MONO, width: 22, color: k < 3 ? C.gold : C.muted, fontWeight: 800 }}>{num(k + 1)}</span>
                  <span style={{ width: 30, height: 30, borderRadius: R.pill, background: r.me ? C.gold : C.surface2, color: r.me ? "var(--bg)" : C.text, display: "grid", placeItems: "center", fontWeight: 800, fontSize: T.base, border: k < 3 ? `2px solid ${C.gold}` : "none" }}>{r.name[0]}</span>
                  <span style={{ flex: 1, fontWeight: r.me ? 800 : 600 }}>{r.name}{r.me && <span style={{ color: C.muted, fontWeight: 400, fontSize: T.sm }}> (أنت)</span>}</span>
                  <span style={{ fontFamily: MONO, fontWeight: 800, color: C.gold, display: "flex", alignItems: "center", gap: 4 }}><Zap size={13} />{num(r.xp)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
