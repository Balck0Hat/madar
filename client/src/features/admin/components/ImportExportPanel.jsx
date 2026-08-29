import { useState } from "react";
import ExportCard from "./ExportCard";
import ImportCard from "./ImportCard";

// «استيراد وتصدير»: قسم مستقل في لوحة المشرف.
// المفتاح يعيد بناء بطاقة التصدير بعد استيراد ناجح لتظهر الوحدات الجديدة في قائمتها.
export default function ImportExportPanel({ onToast, onContentChanged }) {
  const [round, setRound] = useState(0);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ExportCard key={round} onToast={onToast} />
      <ImportCard onToast={onToast} onImported={() => { setRound((r) => r + 1); onContentChanged(); }} />
    </div>
  );
}
