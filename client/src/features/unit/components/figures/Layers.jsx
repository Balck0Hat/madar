import { P, R, S, alpha } from "../../../../shared/constants/theme";

// طبقات من وصف الصورة: «هرم الملك والنبلاء والفرسان والفلاحين» يصير نطاقات
// متراكبة. الهرم يتّسع نزولاً (رتبة وكثرة معاً)، والرصّة متساوية العرض
// (طبقات الغلاف الجوي مثلاً). الاختيار بينهما قرار المراجع لا الآلة.
export default function Layers({ items = [], shape = "pyramid", color }) {
  const n = items.length || 1;
  return (
    <div style={{ display: "grid", gap: S.sm, padding: `${S.md}px 0`, justifyItems: "center" }}>
      {items.map((label, i) => {
        const width = shape === "pyramid" ? 40 + (60 * (i + 1)) / n : 100;
        const tone = 0.18 + (0.55 * i) / Math.max(1, n - 1);
        return (
          <div key={i} style={{ width: `${width}%`, background: alpha(color, tone), color: i >= n / 2 ? P.bg : P.ink, borderRadius: R.sm, padding: `${S.lg}px ${S.x2}px`, textAlign: "center", fontSize: ".9em", fontWeight: 600, lineHeight: 1.4, animation: "madarRise .22s cubic-bezier(.2,.7,.3,1) both", animationDelay: `${i * 40}ms` }}>
            {label}
          </div>
        );
      })}
    </div>
  );
}
