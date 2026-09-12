import { useState } from "react";
import { P, MONO, R, S, alpha } from "../../../../shared/constants/theme";
import Art from "../../../../shared/components/art/Art";

// صورة حقيقية من المشاع العام في إطار الرسمة نفسه. تحميل كسول بأبعاد معلومة
// فلا يقفز التخطيط، وبديل خطّي عند الفشل أو انقطاع الشبكة، وسطر عزو صغير:
// العمل والمصدر والرخصة. من طلب توفير البيانات لا تُطلب له الصورة أصلاً.
export default function ImageFigure({ fig, art, color }) {
  const [failed, setFailed] = useState(false);
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData;
  if (failed || saveData || !fig?.src) return <Art k={art} color={color} />;
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ background: P.card, border: `1px solid ${alpha(color, 0.3)}`, borderRadius: R.x3, overflow: "hidden", aspectRatio: fig.w && fig.h ? `${fig.w} / ${fig.h}` : "3 / 2" }}>
        <img src={fig.src} alt={fig.alt || ""} width={fig.w} height={fig.h} loading="lazy" decoding="async" onError={() => setFailed(true)}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {(fig.credit || fig.license) && (
        <figcaption style={{ fontFamily: MONO, fontSize: ".68em", color: P.muted, marginTop: S.sm, textAlign: "center", lineHeight: 1.5 }}>
          {[fig.credit, fig.license].filter(Boolean).join(" · ")}
        </figcaption>
      )}
    </figure>
  );
}
