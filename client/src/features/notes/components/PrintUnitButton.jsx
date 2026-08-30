import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { C, P, FONT, T, R } from "../../../shared/constants/theme";
import { contentService } from "../../content";
import * as notesService from "../services/notes.service";
import UnitPrintView from "./UnitPrintView";

// «تنزيل PDF» عبر خط الطباعة في المتصفح نفسه: لا مكتبة إضافية، وحوار الطباعة
// يتيح «الحفظ كـ PDF» على كل المنصات. نجهّز المحتوى أولاً ثم نستدعي الطباعة.
export default function PrintUnitButton({ unitId, info, unit: preloaded, small, paper }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!data) return undefined;
    // إطار واحد ريثما يُرسم القالب المخفي قبل أن يلتقطه المتصفح
    const t = setTimeout(() => window.print(), 80);
    return () => clearTimeout(t);
  }, [data]);

  const run = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const unit = preloaded || (await contentService.getUnit(unitId));
      // التظليلات إضافة لطيفة: غيابها لا يمنع الطباعة
      const notes = await notesService.list(unitId).catch(() => []);
      setData({ unit, notes });
    } catch (error) {
      setErr(error.message || "تعذّر تجهيز الملف");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 4, justifyItems: "start" }}>
      <button
        type="button" onClick={run} disabled={busy}
        style={{
          display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontWeight: 700,
          fontSize: small ? T.base : T.md, minHeight: small ? 34 : 44, padding: small ? "7px 12px" : "10px 14px",
          borderRadius: R.lg, cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1,
          background: paper ? P.card : C.surface2, color: paper ? P.ink : C.text, border: `1px solid ${paper ? P.line : C.line}`,
        }}
      >
        <Printer size={15} aria-hidden="true" />{busy ? "نجهّز الملف…" : "تنزيل PDF"}
      </button>
      <div style={{ fontSize: T.xs, lineHeight: 1.7, color: paper ? P.muted : C.muted }}>
        اختر «الحفظ كـ PDF» في حوار الطباعة.
      </div>
      {err && <div role="alert" style={{ fontSize: T.sm, color: C.red }}>{err}</div>}
      {data && <UnitPrintView unit={data.unit} info={info} notes={data.notes} />}
    </div>
  );
}
