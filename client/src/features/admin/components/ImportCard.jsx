import { useRef, useState } from "react";
import { Upload, ShieldCheck } from "lucide-react";
import { C, inputStyle, alpha } from "../../../shared/constants/theme";
import { Btn, Card } from "../../../shared/components/ui";
import { importUnits } from "../services/admin.service";
import { parseUnitsPayload } from "../utils/io.utils";
import ImportReport from "./ImportReport";

const area = { ...inputStyle, padding: "10px 12px", fontSize: 13, lineHeight: 1.7, resize: "vertical", fontFamily: "monospace", direction: "ltr", textAlign: "left" };

// الصق أو ارفع، ثم افحص قبل أن تستورد: التقرير يُعرض في الحالتين
export default function ImportCard({ onToast, onImported }) {
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [force, setForce] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const send = async (dryRun) => {
    setBusy(dryRun ? "check" : "import"); setErr(""); setResult(null);
    try {
      const units = parseUnitsPayload(text);
      const data = await importUnits(units, { force, dryRun });
      setResult(data);
      if (!dryRun && data.imported) { onToast(`استُوردت ${data.imported} وحدة`); onImported(); }
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(""); }
  };

  const pickFile = async (file) => {
    if (!file) return;
    setErr(""); setResult(null);
    try {
      setText(await file.text());
    } catch {
      setErr("تعذّرت قراءة الملف");
    }
  };

  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>استيراد</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 10, lineHeight: 1.7 }}>
        الصق مصفوفة وحدات أو ملف تصدير كامل (حتى 100 وحدة). كل وحدة تُفحص وحدها، ولا يُكتب شيء قبل أن ينجح الفحص.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Btn small full={false} onClick={() => fileRef.current?.click()}>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Upload size={14} />ارفع ملفاً</span>
          </Btn>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={(e) => pickFile(e.target.files?.[0])} style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
          <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13, color: C.muted, cursor: "pointer" }}>
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
            استورد الصالحة وتخطَّ الفاشلة
          </label>
        </div>
        <textarea aria-label="محتوى JSON للاستيراد" value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} rows={8} placeholder='[{"unitId":"earth-1-1", ...}]' style={area} />
        {err && <div role="alert" style={{ color: C.red, fontSize: 13, background: alpha(C.red, 0.12), border: `1px solid ${alpha(C.red, 0.4)}`, borderRadius: 12, padding: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn disabled={!!busy || !text.trim()} onClick={() => send(true)}>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><ShieldCheck size={16} />{busy === "check" ? "يفحص..." : "افحص فقط"}</span>
          </Btn>
          <Btn primary disabled={!!busy || !text.trim()} onClick={() => send(false)}>{busy === "import" ? "لحظة..." : "استورد"}</Btn>
        </div>
        <ImportReport result={result} />
      </div>
    </Card>
  );
}
