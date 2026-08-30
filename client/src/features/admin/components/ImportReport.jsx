import { CheckCircle2, XCircle } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";

// تقرير لكل وحدة: الصالحة سطر واحد، والفاشلة بكل أخطائها ليصلحها المشرف دفعة واحدة
export default function ImportReport({ result }) {
  if (!result) return null;
  const { reports, imported, failed, applied, dryRun } = result;
  const tone = failed ? C.red : C.green;
  const headline = dryRun
    ? failed ? `${failed} وحدة بها أخطاء من ${reports.length}` : `الوحدات ${reports.length} كلها صالحة — يمكنك الاستيراد`
    : applied ? `استُوردت ${imported} وحدة${failed ? ` وتُخطّيت ${failed}` : ""}` : `لم يُستورد شيء: ${failed} وحدة بها أخطاء`;
  return (
    <div role="status" aria-live="polite" style={{ display: "grid", gap: S.lg }}>
      <div style={{ background: alpha(tone, 0.12), border: `1px solid ${alpha(tone, 0.4)}`, borderRadius: R.lg, padding: S.xl, fontSize: T.base, fontWeight: 600, color: tone }}>
        {headline}
      </div>
      <div style={{ display: "grid", gap: S.md, maxHeight: 320, overflowY: "auto" }}>
        {reports.map((r, i) => (
          <div key={`${r.unitId || "?"}-${i}`} style={{ background: C.surface2, border: `1px solid ${r.ok ? C.line : alpha(C.red, 0.4)}`, borderRadius: R.lg, padding: S.xl }}>
            <div style={{ display: "flex", alignItems: "center", gap: S.lg }}>
              {r.ok ? <CheckCircle2 size={15} color={C.green} aria-hidden="true" /> : <XCircle size={15} color={C.red} aria-hidden="true" />}
              <span style={{ fontFamily: MONO, fontSize: T.base }}>{r.unitId || `وحدة ${i + 1}`}</span>
              <span style={{ fontSize: T.sm, color: C.muted }}>{r.ok ? "صالحة" : `${r.errors.length} خطأ`}</span>
            </div>
            {!r.ok && (
              <ul style={{ margin: `${S.md}px 0 0`, paddingInlineStart: S.x4, color: C.muted, fontSize: T.sm, lineHeight: 1.9 }}>
                {r.errors.map((e, j) => <li key={j} style={{ color: C.text }}>{e}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
