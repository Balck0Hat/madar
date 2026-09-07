import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { C, FONT, T, R, S, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { getDomainContent } from "../services/domain.service";
import DomainPrintView from "./DomainPrintView";

// «تنزيل PDF» للمجال كله عبر خط الطباعة في المتصفح: لا مكتبة إضافية، وحوار
// الطباعة يتيح «الحفظ كـ PDF» على كل المنصات — وهو أيضاً الوحيد الذي يرسم
// العربية بتشكيلها ووصلها صحيحاً بلا تضمين خطوط يدوياً.
export default function DomainPrintButton({ domain }) {
  const num = useNum();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!data) return undefined;
    // إطار ريثما يُرسم القالب المخفي قبل أن يلتقطه المتصفح؛ الملف هنا أكبر
    const t = setTimeout(() => window.print(), 200);
    return () => clearTimeout(t);
  }, [data]);

  const run = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      setData(await getDomainContent(domain.id));
    } catch (error) {
      setErr(error.message || "تعذّر تجهيز الملف");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: S.sm, marginTop: S.x3 }}>
      <button
        type="button" onClick={run} disabled={busy} className="madar-press"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: S.md,
          fontFamily: FONT, fontWeight: 600, fontSize: T.md, minHeight: TAP,
          padding: `${S.xl}px ${S.x3}px`, borderRadius: R.lg, width: "100%",
          cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1,
          background: C.surface2, color: C.text, border: `1px solid ${C.line}`,
        }}
      >
        <Download size={15} aria-hidden="true" />
        {busy ? "نجهّز الملف…" : `تنزيل المجال PDF${data ? ` (${num(data.units)} وحدة)` : ""}`}
      </button>
      <div style={{ fontSize: T.xs, lineHeight: 1.7, color: C.muted }}>
        كل دروس المجال في ملف واحد. اختر «الحفظ كـ PDF» في حوار الطباعة.
      </div>
      {err && <div role="alert" style={{ fontSize: T.sm, color: C.red }}>{err}</div>}
      {data && <DomainPrintView data={data} domain={domain} />}
    </div>
  );
}
