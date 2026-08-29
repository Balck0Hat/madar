import { useAsync } from "../../../shared/hooks/useAsync";
import { TopBar, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { getStats } from "../services/stats.service";
import WeeklyXpChart from "./WeeklyXpChart";
import DomainPanel from "./DomainPanel";
import StatTiles from "./StatTiles";

// إحصاءاتي: النقاط الأسبوعية، إنجاز المجالات، وبطاقات موجزة
export default function StatsScreen({ onBack }) {
  const { data, loading, error, reload } = useAsync(getStats, []);
  // لا بيانات = لم تُنجز أي وحدة بعد؛ نعرض دعوة للبدء بدل رسوم فارغة
  const empty = data && !data.weeks.some((w) => w.xp > 0) && !data.byDomain.some((d) => d.done > 0);

  return (
    <div className="madar-in" style={{ paddingBottom: 90 }}>
      <TopBar title="إحصاءاتي" onBack={onBack} />
      <div style={{ padding: "0 16px", display: "grid", gap: 12 }} aria-live="polite" aria-busy={loading}>
        {loading && <Skeleton lines={5} />}
        {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
        {empty && <EmptyState title="لا إحصاءات بعد" text="ابدأ أول وحدة لترى إحصاءاتك." action="إلى الخريطة" onAction={onBack} />}
        {data && !empty && (
          <>
            <StatTiles strongest={data.strongest} weakest={data.weakest} totalMinutes={data.totalMinutes} quizAccuracy={data.quizAccuracy} />
            <WeeklyXpChart weeks={data.weeks} />
            <DomainPanel rows={data.byDomain} />
          </>
        )}
      </div>
    </div>
  );
}
