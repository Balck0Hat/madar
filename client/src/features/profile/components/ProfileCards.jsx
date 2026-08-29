import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Card, Pill } from "../../../shared/components/ui";
import ShareCard from "./ShareCard";
import Certificate from "./Certificate";

export function ShareSection({ profile, progress, level, st, refEl, onSave }) {
  const num = useNum();
  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>عجلتي</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>بطاقة طولية للستوري: الخيوط الذهبية هي ما يربط معرفتك.</div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 150, flexShrink: 0, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}><ShareCard profile={profile} progress={progress} level={level} refEl={refEl} /></div>
        <div style={{ flex: 1, display: "grid", gap: 8 }}>
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{num(st.units)} وحدة · {num(st.threads)} خيط · {st.rank}</div>
          <Btn small onClick={onSave}>إنشاء صورة</Btn>
        </div>
      </div>
    </Card>
  );
}

export function CertificateSection({ profile, st, code, date, refEl, onSave }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>الشهادة</div>
        {!st.ring1Done && <Pill color={C.muted}>معاينة</Pill>}
      </div>
      <Certificate name={profile.name} earned={st.ring1Done} code={code} date={date} refEl={refEl} />
      <div style={{ color: C.muted, fontSize: 12, margin: "10px 0" }}>{st.ring1Done ? "شهادتك موثقة برقم تحقق." : "تُمنح بعد إكمال المدار الأول واجتياز امتحانه."}</div>
      <Btn small onClick={onSave}>إنشاء صورة</Btn>
    </Card>
  );
}

export function NumToggle({ arabicNums, onToggle }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontWeight: 800 }}>الأرقام</div><div style={{ color: C.muted, fontSize: 12 }}>اختر شكل الأرقام في كل التطبيق</div></div>
        <div role="group" aria-label="شكل الأرقام" style={{ display: "flex", background: C.surface2, borderRadius: 999, padding: 3, border: `1px solid ${C.line}` }}>
          {[["123", false], ["١٢٣", true]].map(([l, v]) => (
            <button key={l} type="button" aria-pressed={arabicNums === v} onClick={() => onToggle(v)} style={{ background: arabicNums === v ? C.gold : "transparent", color: arabicNums === v ? "#141B33" : C.muted, border: "none", borderRadius: 999, padding: "6px 14px", fontFamily: MONO, fontWeight: 800, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ImagePreview({ src, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} role="dialog" aria-label="معاينة الصورة" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 12 }}>
      <img src={src} alt="صورة للمشاركة" style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }} />
      <div style={{ color: C.text, fontSize: 13, textAlign: "center" }}>اضغط مطولاً على الصورة لحفظها، أو اضغط في أي مكان للإغلاق</div>
    </div>
  );
}
