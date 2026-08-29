import { Award, Share2, BookOpen, ShieldCheck } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Card, Pill } from "../../../shared/components/ui";
import ShareCard from "./ShareCard";
import Certificate from "./Certificate";

export function ShareSection({ profile, progress, level, st, refEl, onSave, onToast }) {
  const num = useNum();
  const url = `${window.location.origin}/u/${encodeURIComponent(profile.handle || "")}`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `عجلة ${profile.name} على مدار`, url });
      else { await navigator.clipboard.writeText(url); onToast("نُسخ رابط صفحتك العامة"); }
    } catch (err) { if (err.name !== "AbortError") onToast("تعذّرت المشاركة"); }
  };
  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>عجلتي</div>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>صفحة عامة برابط، وبطاقة طولية للستوري.</div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 150, flexShrink: 0, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}><ShareCard profile={profile} progress={progress} level={level} refEl={refEl} /></div>
        <div style={{ flex: 1, display: "grid", gap: 8 }}>
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{num(st.units)} وحدة · {num(st.threads)} خيط · {st.rank}</div>
          <Btn small primary onClick={share}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Share2 size={14} />مشاركة الرابط</span></Btn>
          <Btn small onClick={onSave}>إنشاء صورة</Btn>
        </div>
      </div>
    </Card>
  );
}

export function CertificateSection({ profile, st, certificate, date, refEl, onSave, onExam }) {
  const earned = Boolean(certificate);
  const code = certificate?.code || "MDR-····-·····";
  const issued = certificate ? new Date(certificate.issuedAt).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }) : date;
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>الشهادة</div>
        <Pill color={earned ? C.green : C.muted}>{earned ? "موثقة" : "معاينة"}</Pill>
      </div>
      <Certificate name={profile.name} earned={earned} code={code} date={issued} refEl={refEl} />
      <div style={{ color: C.muted, fontSize: 12, margin: "10px 0", lineHeight: 1.7 }}>
        {earned ? <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><ShieldCheck size={13} color={C.green} />رابط التحقق: <span style={{ fontFamily: MONO }}>{window.location.origin}/verify/{code}</span></span> : st.ring1Done ? "أكملت المدار الأول. اجتز الامتحان لتُمنح الشهادة." : "تُمنح بعد إكمال المدار الأول واجتياز امتحانه."}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {!earned && <Btn small primary disabled={!st.ring1Done} onClick={onExam}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Award size={14} />امتحان المدار</span></Btn>}
        <Btn small onClick={onSave}>إنشاء صورة</Btn>
      </div>
    </Card>
  );
}

export function LibraryLink({ count, onOpen }) {
  const num = useNum();
  return (
    <Card onClick={onOpen}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}><BookOpen size={16} color={C.gold} />مكتبتي</div>
        <span style={{ color: C.muted, fontSize: 12 }}>{num(count)} خلاصة</span>
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
