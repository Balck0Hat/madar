import { Check } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Pill, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { contentService } from "../../content";
import { PrintUnitButton } from "../../notes";

// خلاصات الوحدات المكتملة، ومع كل خلاصة تنزيل نسخة الوحدة كـ PDF
export default function SummaryList({ ids, onBack, onOpenUnit }) {
  const { data, loading, error, reload } = useAsync(
    () => (ids.length ? contentService.getSummaries(ids) : Promise.resolve([])),
    [ids.join(",")],
  );
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {loading && <Skeleton lines={5} />}
      {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
      {data && !data.length && <EmptyState title="المكتبة فارغة" text="خلاصة كل وحدة مكتوبة تُحفظ هنا بعد إكمالها." action="إلى الخريطة" onAction={onBack} />}
      {data?.map((s) => {
        const info = unitInfo(s.unitId);
        return (
          <Card key={s.unitId} accent={info.color} onClick={() => onOpenUnit(s.unitId)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 800, lineHeight: 1.5 }}>{s.title}</div>
              <Pill color={info.color}>{info.domainName}</Pill>
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {s.summary.map((line, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.7, color: C.text }}><Check size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 5 }} />{line}</div>)}
            </div>
            {/* البطاقة نفسها زر يفتح الوحدة، فنمنع نقرة الطباعة من الوصول إليه */}
            <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <PrintUnitButton unitId={s.unitId} info={info} small />
            </div>
          </Card>
        );
      })}
      {data && data.length > 0 && data.length < ids.length && <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>الوحدات المحاكاة لا تملك خلاصة بعد.</div>}
    </div>
  );
}
