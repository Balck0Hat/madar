import { Award, Flame, Link2 } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { BADGES } from "../../../shared/data/curriculum";
import { levelFromXp, levelTitle } from "../../../shared/utils/level";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, Pill, OrbitMark, Skeleton, ErrorState } from "../../../shared/components/ui";
import Wheel from "../../../shared/components/wheel/Wheel";
import { getProfile } from "../services/public.service";

// صفحة عامة: عجلة متعلّم وإحصاءاته (/u/:handle)
export default function PublicProfile({ handle, onHome }) {
  const num = useNum();
  const { data: p, loading, error, reload } = useAsync(() => getProfile(handle), [handle]);
  const progress = p ? Object.fromEntries(p.progressIds.map((id) => [id, { score: 1, total: 1 }])) : {};
  const level = p ? levelFromXp(p.xp) : 1;
  return (
    <div className="madar-in" style={{ minHeight: "100vh", padding: "24px 18px 40px", display: "grid", alignContent: "start", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontWeight: 900, fontSize: 22 }}>مدار</div><Btn small full={false} onClick={onHome}>ابدأ رحلتك</Btn></div>
      {loading && <Skeleton lines={5} />}
      {error && <ErrorState message={error.message} onRetry={reload} onBack={onHome} />}
      {p && (
        <>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900 }}>عجلة {p.name}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}><Pill>المستوى {num(level)} · {levelTitle(level)}</Pill><Pill color={C.text}>{p.stats.ring1Done ? "مثقف" : p.stats.centerDone && p.stats.sectors >= 1 ? "مستكشف" : "زائر"}</Pill></div>
          </div>
          <Wheel progress={progress} level={level} size="100%" compact sky />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[["وحدات", p.stats.units], ["خيوط", p.stats.threads], ["قطاعات", p.stats.sectors], ["سلسلة", p.streak]].map(([l, v]) => <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 6px", textAlign: "center" }}><div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.gold }}>{num(v)}</div><div style={{ color: C.muted, fontSize: 11 }}>{l}</div></div>)}
          </div>
          {p.certificate && <Card accent={C.gold}><div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}><Award size={16} color={C.gold} />حائز على شهادة الثقافة العامة</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4, fontFamily: MONO }}>{p.certificate.code}</div></Card>}
          {p.badges.length > 0 && (
            <Card>
              <div style={{ fontWeight: 800, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Flame size={15} color={C.gold} />الأوسمة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{p.badges.map((id) => <Pill key={id}>{BADGES.find((b) => b.id === id)?.name || id}</Pill>)}</div>
            </Card>
          )}
          <div style={{ color: C.muted, fontSize: 12, textAlign: "center", display: "flex", justifyContent: "center", gap: 6, alignItems: "center" }}><Link2 size={12} />الخيوط الذهبية على العجلة تربط مجالين معرفيين.</div>
          <OrbitMark size={56} />
        </>
      )}
    </div>
  );
}
