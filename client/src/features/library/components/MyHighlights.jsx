import { ArrowUpLeft } from "lucide-react";
import { C, READ, FONT, alpha } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/PrefsContext";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Card, Pill, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { notesService, tintOf } from "../../notes";
import { groupByUnit } from "../utils/group";

// «تظليلاتي»: كل ما ظلّله القارئ مجموعاً بوحدته، ومن كل تظليل طريق عودة إلى موضعه
export default function MyHighlights({ onBack, onOpenUnit }) {
  const num = useNum();
  const { data, loading, error, reload } = useAsync(() => notesService.list(), []);
  const groups = groupByUnit(data || []);

  if (loading) return <Skeleton lines={5} />;
  if (error) return <ErrorState message={error.message} onRetry={reload} onBack={onBack} />;
  if (!groups.length) {
    return <EmptyState title="لا تظليلات بعد" text="حدّد أي جملة داخل الدرس ليظهر لك «تظليل» و«تظليل مع ملاحظة»." action="إلى الخريطة" onAction={onBack} />;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {groups.map(({ unitId, notes }) => {
        const info = unitInfo(unitId);
        return (
          <Card key={unitId} accent={info.color}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 800, lineHeight: 1.5 }}>{info.title}</div>
              <Pill color={info.color}>{info.domainName}</Pill>
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {notes.map((n) => (
                <div key={n.id} style={{ borderInlineStart: `3px solid ${tintOf(n.color)}`, paddingInlineStart: 10 }}>
                  <div style={{ fontFamily: READ, fontSize: 15, lineHeight: 1.9, background: alpha(tintOf(n.color), 0.14), borderRadius: 8, padding: "3px 6px" }}>{n.text}</div>
                  {n.note && <div style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, marginTop: 5 }}>— {n.note}</div>}
                  {/* الوسيط الثاني (الصفحة) اختياري: من يفتح الوحدة قد يتجاهله فتُفتح من أولها */}
                  <button type="button" onClick={() => onOpenUnit(unitId, n.page)} style={link}>
                    <ArrowUpLeft size={13} aria-hidden="true" />افتح عند الصفحة {num(n.page + 1)}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const link = { display: "flex", alignItems: "center", gap: 4, marginTop: 6, background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.gold };
