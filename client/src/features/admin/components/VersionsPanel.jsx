import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { C } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Skeleton, ErrorState, EmptyState } from "../../../shared/components/ui";
import { listVersions, restoreVersion } from "../services/admin.service";
import { countsOf } from "../utils/io.utils";
import VersionRow from "./VersionRow";

// «النسخ السابقة»: مطوية افتراضياً حتى لا تزاحم المحرّر، وتُجلب عند الفتح فقط
export default function VersionsPanel({ unitId, current, onRestored, onToast }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");
  const { data, loading, error, reload } = useAsync(() => listVersions(unitId), [unitId, open], { enabled: open });
  const currentCounts = countsOf(current);

  const restore = async (version) => {
    setBusy(version); setErr("");
    try {
      const unit = await restoreVersion(unitId, version);
      onToast(`استُعيدت النسخة ${version}`);
      onRestored(unit);
      reload();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(0); }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: C.gold, fontWeight: 800, fontSize: 14, cursor: "pointer", padding: 0, font: "inherit" }}
      >
        <History size={16} aria-hidden="true" />
        النسخ السابقة
        <ChevronDown size={16} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease-out" }} />
      </button>
      {open && (
        <div style={{ display: "grid", gap: 8 }}>
          {loading && <Skeleton lines={3} />}
          {error && <ErrorState message={error.message} onRetry={reload} />}
          {data && !data.length && <EmptyState title="لا نسخ بعد" text="تُحفظ نسخة تلقائياً في كل مرة تحفظ فيها وحدة موجودة." />}
          {err && <div role="alert" style={{ color: C.red, fontSize: 13 }}>{err}</div>}
          {data?.map((v) => <VersionRow key={v.version} version={v} current={currentCounts} busy={busy === v.version} onRestore={restore} />)}
          {data?.length > 0 && <div style={{ color: C.muted, fontSize: 12 }}>تُحفظ آخر 20 نسخة لكل وحدة؛ الفروق أعلاه مقارنةً بالمحتوى المعروض الآن.</div>}
        </div>
      )}
    </div>
  );
}
