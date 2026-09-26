import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { C, R, S, T, TAP, inputStyle } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn, ConfirmSheet } from "../../../shared/components/ui";

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

// مهمة كتابة قصيرة بمؤقت وعدّاد كلمات؛ التصحيح يجري في الخلفية على الخادم بعد الإرسال
export default function WritingPart({ writing, onSubmit, onSkip, busy }) {
  const num = useNum();
  const [text, setText] = useState("");
  const [left, setLeft] = useState(writing.minutes * 60);
  const [asking, setAsking] = useState(false); // تأكيد قبل التخطي: التقدير بلا كتابة أقل دقة
  useEffect(() => { const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const n = words(text);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ color: C.muted, fontSize: T.xs }}>كتابة · اختيارية، لكنها أدق مؤشر على مستواك</div>
      <div dir="ltr" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x3, textAlign: "left", fontFamily: "Georgia, serif", fontSize: T.lg, lineHeight: 1.7 }}>{writing.prompt}</div>
      <div style={{ display: "flex", justifyContent: "space-between", color: left < 60 ? C.red : C.muted, fontSize: T.sm }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Clock size={14} aria-hidden="true" />{num(mm)}:{num(ss)}</span>
        <span>{num(n)} كلمة · الهدف نحو {num(writing.words)}</span>
      </div>
      <textarea dir="ltr" value={text} onChange={(e) => setText(e.target.value)} aria-label="نصّ الكتابة" rows={9} placeholder="Write here…" spellCheck={false}
        style={{ ...inputStyle, fontFamily: "Georgia, serif", fontSize: T.lg, lineHeight: 1.7, textAlign: "left", minHeight: 200, resize: "vertical" }} />
      <div style={{ display: "flex", gap: S.lg }}>
        <Btn primary disabled={busy || n < 20} onClick={() => onSubmit(text)}>{busy ? "جارٍ الإرسال…" : "أرسل للتصحيح"}</Btn>
        <Btn paper full={false} disabled={busy} onClick={() => setAsking(true)}>تخطَّ</Btn>
      </div>
      {asking && <ConfirmSheet title="تتخطى الكتابة؟" text="الكتابة أدق مؤشر على مستواك: بلا كتابة يُقدَّر مستواك من ثلاث مهارات فقط، وتفوتك أهم الأخطاء التي يصحّحها لك النموذج. جملتان أو ثلاث تكفي." confirmLabel="تخطَّ على أي حال" cancelLabel="أكتب" onConfirm={() => { setAsking(false); onSkip(); }} onCancel={() => setAsking(false)} />}
      <div style={{ color: C.muted, fontSize: T.xs, lineHeight: 1.7, minHeight: TAP }}>يصحّحه نموذج لغوي على الخادم خلال نحو نصف دقيقة: مستوى تقريبي، أهم الأخطاء بتصحيحها، ونصائح. النتيجة تُحسب فوراً وتُحدَّث حين ينتهي.</div>
    </div>
  );
}
