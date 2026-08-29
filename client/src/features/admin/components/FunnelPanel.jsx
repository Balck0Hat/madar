import { C } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getFunnel } from "../services/analytics.service";
import FunnelBars, { STAGES } from "./FunnelBars";

// «أين يتوقف المتعلمون»: القمع لكل وحدة، الأسوأ إتماماً أولاً — هنا يعرف المشرف ما يستحق إعادة الكتابة
export default function FunnelPanel() {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(getFunnel, []);
  if (loading) return <Skeleton lines={4} />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  const units = data?.units || [];

  return (
    <Card>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>أين يتوقف المتعلمون</h3>
      <p style={{ margin: "4px 0 10px", color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
        رحلة كل وحدة من الفتح إلى الإنهاء خلال آخر {num(data?.days || 90)} يوماً، مرتّبة بالأسوأ إتماماً أولاً.
      </p>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", margin: "0 0 12px", padding: 0, listStyle: "none" }}>
        {STAGES.map((s, i) => (
          <li key={s.key} style={{ display: "flex", alignItems: "center", gap: 5, color: C.muted, fontSize: 11 }}>
            <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 999, background: s.color, display: "inline-block" }} />
            {num(i + 1)}. {s.label}
          </li>
        ))}
      </ul>
      {!units.length ? (
        <EmptyState title="لا رحلات مسجّلة بعد" text="تظهر هنا بعد أن يفتح المتعلمون الوحدات ويقرؤوا بطاقاتها." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {units.map((row) => <FunnelBars key={row.unitId} row={row} />)}
        </div>
      )}
    </Card>
  );
}
