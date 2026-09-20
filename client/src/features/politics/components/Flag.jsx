import { useState } from "react";
import { C, R } from "../../../shared/constants/theme";

// علم الدولة صورةً لا رمزاً تعبيرياً: ويندوز لا يرسم أعلام الإيموجي (يعرض حرفين)،
// وبعض الأجهزة تعرض مربعين. الرمز يبقى بديلاً إن تعذّر تحميل الصورة.
export default function Flag({ country, width = 44 }) {
  const [failed, setFailed] = useState(false);
  const height = Math.round((width * 2) / 3);
  if (!country?.iso2 || failed) return <span aria-hidden="true" style={{ fontSize: width * 0.8, lineHeight: 1, flexShrink: 0 }}>{country?.flag}</span>;
  return (
    <img src={`/flags/${country.iso2}.svg`} alt="" width={width} height={height} loading="lazy" decoding="async" onError={() => setFailed(true)}
      style={{ display: "block", width, height, objectFit: "cover", borderRadius: R.xs, border: `1px solid ${C.line}`, flexShrink: 0 }} />
  );
}
