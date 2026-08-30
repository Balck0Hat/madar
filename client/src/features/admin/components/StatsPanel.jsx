import { C, MONO, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Pill, Bar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getOverview } from "../services/admin.service";
import FunnelPanel from "./FunnelPanel";

// لوحة الإحصاءات: أرقام عامة، تكاملات، أين يتوقف المتعلمون، وأكثر الأسئلة خطأً
export default function StatsPanel() {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(getOverview, []);
  if (loading) return <Skeleton lines={5} />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  const tiles = [["المستخدمون", data.users], ["نشطون هذا الأسبوع", data.activeWeek], ["جدد هذا الأسبوع", data.newWeek], ["وحدات مكتملة", data.unitsCompleted], ["شهادات", data.certificates], ["وحدات منشورة", data.published]];
  const integ = [["الذكاء الاصطناعي", data.integrations.ai], ["الإشعارات", data.integrations.push], ["دخول Google", data.integrations.google]];
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: S.lg }}>
        {tiles.map(([l, v]) => <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.xl}px ${S.lg}px`, textAlign: "center" }}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: T.x3, color: C.gold }}>{num(v)}</div><div style={{ color: C.muted, fontSize: T.xs }}>{l}</div></div>)}
      </div>
      <Card>
        <div style={{ fontWeight: 700, marginBottom: S.lg }}>التكاملات</div>
        <div style={{ display: "flex", gap: S.md, flexWrap: "wrap" }}>{integ.map(([l, on]) => <Pill key={l} color={on ? C.green : C.muted}>{l}: {on ? "مفعّل" : "معطّل"}</Pill>)}</div>
        <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.lg }}>تُضبط من ملف .env على الخادم. مسودات: {num(data.drafts)}.</div>
      </Card>
      <FunnelPanel />
      <Card>
        <div style={{ fontWeight: 700, marginBottom: S.sm }}>أسئلة يُخطئ فيها المتعلمون</div>
        <div style={{ color: C.muted, fontSize: T.sm, marginBottom: S.xl }}>مرتبة بعدد الأخطاء؛ الأسئلة المعروضة 3 مرات على الأقل.</div>
        {!data.hardQuestions.length && <EmptyState title="لا بيانات كافية بعد" text="تظهر هنا بعد أن يجيب المتعلمون على أسئلة أكثر." />}
        <div style={{ display: "grid", gap: S.xl }}>
          {data.hardQuestions.map((h) => (
            <div key={`${h.unitId}:${h.qid}`}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.base, gap: S.lg }}>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{h.q || h.qid} <span style={{ color: C.muted }}>· {h.unit || h.unitId}</span></span>
                <span style={{ fontFamily: MONO, color: h.rate >= 50 ? C.red : C.gold, fontWeight: 700 }}>{num(h.rate)}%</span>
              </div>
              <div style={{ marginTop: S.sm }}><Bar value={h.rate / 100} color={h.rate >= 50 ? C.red : C.gold} h={5} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
