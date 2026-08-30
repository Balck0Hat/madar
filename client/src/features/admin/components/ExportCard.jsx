import { useState } from "react";
import { Download } from "lucide-react";
import { C, inputStyle, T } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Btn, Card, Skeleton, ErrorState } from "../../../shared/components/ui";
import { listUnits, exportAll, exportUnit } from "../services/admin.service";
import { downloadJson } from "../utils/io.utils";

const small = { ...inputStyle, padding: "9px 12px", fontSize: T.md };
const stamp = () => new Date().toISOString().slice(0, 10);

// تنزيل كل الوحدات أو وحدة بعينها كـ JSON نظيف يقبله الاستيراد كما هو
export default function ExportCard({ onToast }) {
  const { data, loading, error, reload } = useAsync(listUnits, []);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async (fn, filename, done) => {
    setBusy(true); setErr("");
    try {
      downloadJson(filename, await fn());
      onToast(done);
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  if (loading) return <Skeleton lines={3} />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>تصدير</div>
      <div style={{ color: C.muted, fontSize: T.sm, marginBottom: 10, lineHeight: 1.7 }}>
        ملف JSON نظيف بلا حقول قاعدة البيانات، يصلح للنسخ الاحتياطي وللاستيراد في خادم آخر.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <Btn disabled={busy} onClick={() => run(exportAll, `madar-units-${stamp()}.json`, `نُزّلت ${data.length} وحدة`)}>
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Download size={16} />تنزيل كل الوحدات ({data.length})</span>
        </Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <select aria-label="اختر وحدة للتصدير" value={pick} onChange={(e) => setPick(e.target.value)} style={small}>
            <option value="">تنزيل وحدة بعينها…</option>
            {data.map((u) => <option key={u.unitId} value={u.unitId}>{u.unitId} · {u.title}</option>)}
          </select>
          <Btn small full={false} disabled={busy || !pick} onClick={() => run(() => exportUnit(pick), `${pick}.json`, `نُزّلت ${pick}`)}>
            <Download size={16} />
          </Btn>
        </div>
        {err && <div role="alert" style={{ color: C.red, fontSize: T.base }}>{err}</div>}
      </div>
    </Card>
  );
}
