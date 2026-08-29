import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Pill, Bar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getOverview } from "../services/admin.service";

// لوحة الإحصاءات: أرقام عامة، تكاملات، وأكثر الأسئلة خطأً
export default function StatsPanel() {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(getOverview, []);
  if (loading) return <Skeleton lines={5} />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  const tiles = [["المستخدمون", data.users], ["نشطون هذا الأسبوع", data.activeWeek], ["جدد هذا الأسبوع", data.newWeek], ["وحدات مكتملة", data.unitsCompleted], ["شهادات", data.certificates], ["وحدات منشورة", data.published]];
  const integ = [["الذكاء الاصطناعي", data.integrations.ai], ["الإشعارات", data.integrations.push], ["دخول Google", data.integrations.google]];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {tiles.map(([l, v]) => <div key={l} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}><div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.gold }}>{num(v)}</div><div style={{ color: C.muted, fontSize: 11 }}>{l}</div></div>)}
      </div>
      <Card>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>التكاملات</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{integ.map(([l, on]) => <Pill key={l} color={on ? C.green : C.muted}>{l}: {on ? "مفعّل" : "معطّل"}</Pill>)}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>تُضبط من ملف .env على الخادم. مسودات: {num(data.drafts)}.</div>
      </Card>
      <Card>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>أسئلة يُخطئ فيها المتعلمون</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>مرتبة بعدد الأخطاء؛ الأسئلة المعروضة 3 مرات على الأقل.</div>
        {!data.hardQuestions.length && <EmptyState title="لا بيانات كافية بعد" text="تظهر هنا بعد أن يجيب المتعلمون على أسئلة أكثر." />}
        <div style={{ display: "grid", gap: 10 }}>
          {data.hardQuestions.map((h) => (
            <div key={`${h.unitId}:${h.qid}`}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 8 }}>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{h.q || h.qid} <span style={{ color: C.muted }}>· {h.unit || h.unitId}</span></span>
                <span style={{ fontFamily: MONO, color: h.rate >= 50 ? C.red : C.gold, fontWeight: 800 }}>{num(h.rate)}%</span>
              </div>
              <div style={{ marginTop: 4 }}><Bar value={h.rate / 100} color={h.rate >= 50 ? C.red : C.gold} h={5} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
