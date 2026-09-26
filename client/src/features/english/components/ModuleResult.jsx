import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import SkillsReport from "./SkillsReport";

const KIND = { detail: "التفاصيل", main: "الفكرة الرئيسة", vocab: "معنى الكلمة", inference: "الاستنتاج", tfng: "صح/خطأ/غير مذكور", ynng: "نعم/لا/غير مذكور", gap: "إكمال الفراغ", heading: "مطابقة العناوين", match: "المطابقة", purpose: "الغرض", attitude: "موقف المتكلم", insert: "إدراج جملة", summary: "الملخّص", negative: "الاستثناء", function: "وظيفة العبارة" };

// نتيجة وحدة قراءة/استماع: الدرجة التقريبية كبيرة، الخام والنسبة، ثم نوع الأسئلة الأضعف
export default function ModuleResult({ module, score, onRetry, onBack }) {
  const num = useNum();
  if (!score) return null;
  const band = score.band;
  const label = band?.scale === "ielts" ? `درجة آيلتس تقريبية` : band?.scale === "toefl" ? `درجة توفل تقريبية من 30` : "النتيجة";
  const kinds = score.kinds.map((k) => ({ key: k.k, label: KIND[k.k] || k.k, n: k.n, ok: k.ok, rate: k.rate }));
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      <div style={{ textAlign: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x3, padding: S.x5, boxShadow: "var(--shadow-1)" }}>
        <div style={{ color: C.muted, fontSize: T.sm }}>{label}</div>
        <div className="madar-num" style={{ fontSize: T.display, fontWeight: 700, color: C.gold, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>{band ? num(band.value) : num(score.pct) + "٪"}</div>
        <div style={{ fontWeight: 700 }}>{num(score.raw)} من {num(score.total)} · {num(score.pct)}٪</div>
        <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.x2, lineHeight: 1.7 }}>{module.title} · تقدير من جدول التحويل المتعارف عليه، لا درجة رسمية.</div>
      </div>
      <SkillsReport kinds={kinds} />
      <div style={{ background: alpha(C.gold, 0.08), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.x2, padding: S.x3, lineHeight: 1.8, fontSize: T.sm }}>
        راجع الأسئلة الخاطئة فوق: الشرح تحت كل سؤال يقتبس الجملة الدالة من النصّ، وهذا ما يفصل بين الدرجة الحالية والتي بعدها.
      </div>
      <div style={{ display: "flex", gap: S.lg }}>
        <Btn primary onClick={onBack}>عودة إلى المسار</Btn>
        <Btn paper full={false} onClick={onRetry}>أعد الوحدة</Btn>
      </div>
    </div>
  );
}
