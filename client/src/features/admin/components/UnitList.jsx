import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { C, MONO, inputStyle } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, Pill, Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { listUnits } from "../services/admin.service";
import { ALL_UNIT_IDS } from "../utils/editor.utils";

// قائمة الوحدات المكتوبة + إنشاء وحدة من الشجرة
export default function UnitList({ onEdit, onCreate }) {
  const { data, loading, error, reload } = useAsync(listUnits, []);
  const [pick, setPick] = useState("");
  const [filter, setFilter] = useState("");
  const existing = new Set((data || []).map((u) => u.unitId));
  const candidates = ALL_UNIT_IDS.filter((id) => !existing.has(id)).filter((id) => !filter || unitInfo(id).title.includes(filter) || id.includes(filter));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>وحدة جديدة</div>
        <input aria-label="بحث في الشجرة" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="ابحث بالعنوان أو المعرّف" style={{ ...inputStyle, padding: "9px 12px", fontSize: 14, marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <select aria-label="اختر وحدة" value={pick} onChange={(e) => setPick(e.target.value)} style={{ ...inputStyle, padding: "9px 12px", fontSize: 14 }}>
            <option value="">اختر من الشجرة ({candidates.length})</option>
            {candidates.slice(0, 120).map((id) => <option key={id} value={id}>{id} · {unitInfo(id).title}</option>)}
          </select>
          <Btn primary small full={false} disabled={!pick} onClick={() => onCreate(pick)}><Plus size={16} /></Btn>
        </div>
      </Card>
      {loading && <Skeleton lines={4} />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !data.length && <EmptyState title="لا وحدات بعد" text="ابدأ بإنشاء وحدة من الشجرة أعلاه." />}
      {data?.map((u) => {
        const info = unitInfo(u.unitId);
        return (
          <Card key={u.unitId} accent={info.color} onClick={() => onEdit(u.unitId)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.5 }}>{u.title}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: MONO }}>{u.unitId} · {u.questionCount} سؤال · {new Date(u.updatedAt).toLocaleDateString("ar")}</div>
              </div>
              <Pill color={u.published ? C.green : C.muted}>{u.published ? "منشورة" : "مسودة"}</Pill>
              <Pencil size={16} color={C.muted} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
