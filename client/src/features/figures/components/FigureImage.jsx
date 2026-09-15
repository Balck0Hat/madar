import { useState } from "react";
import { P, MONO, R, S, alpha } from "../../../shared/constants/theme";

// صورة الشخصية: تمثال أو نقش أو لوحة من المشاع العام، بإطار ثابت 3:2 يُقصّ
// من أعلاه قليلاً لأن الوجوه في أعلى الصورة. بلا صورة لا يُرسم شيء، ولا
// تُطلب لمن طلب توفير البيانات. الأنبياء بلا صورة عمداً.
export default function FigureImage({ image, color, name }) {
  const [failed, setFailed] = useState(false);
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData;
  if (!image?.src || failed || saveData) return null;
  return (
    <figure style={{ margin: `0 0 ${S.x4}px` }}>
      <div style={{ background: P.card, border: `1px solid ${alpha(color, 0.3)}`, borderRadius: R.x3, overflow: "hidden", aspectRatio: "3 / 2" }}>
        <img src={image.src} alt={image.alt || name} width={image.w} height={image.h} loading="lazy" decoding="async" onError={() => setFailed(true)}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%" }} />
      </div>
      {(image.credit || image.license) && (
        <figcaption style={{ fontFamily: MONO, fontSize: ".68em", color: P.muted, marginTop: S.sm, textAlign: "center", lineHeight: 1.5 }}>
          {[image.credit, image.license].filter(Boolean).join(" · ")}
        </figcaption>
      )}
    </figure>
  );
}
