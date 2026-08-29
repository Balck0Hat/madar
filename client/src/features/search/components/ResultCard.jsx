import { C } from "../../../shared/constants/theme";
import { Card, Pill } from "../../../shared/components/ui";
import { safeUnitInfo, splitMatches } from "../utils/result.utils";

// بطاقة نتيجة: عنوان الوحدة، اسم المجال بلونه، والمقتطف مع إبراز الكلمة المطابقة
export default function ResultCard({ result, onOpen }) {
  const info = safeUnitInfo(result.unitId, result.title);
  const parts = splitMatches(result.snippet);

  return (
    <Card accent={info.color} onClick={() => onOpen(result.unitId)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontWeight: 800, lineHeight: 1.5 }}>{result.title || info.title}</div>
        {info.domainName && <Pill color={info.color}>{info.domainName}</Pill>}
      </div>
      {result.snippet && (
        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.8, color: C.muted }}>
          {parts.map((part, i) =>
            i % 2 === 1
              ? <strong key={i} style={{ color: C.gold, fontWeight: 800 }}>{part}</strong>
              : <span key={i}>{part}</span>
          )}
        </p>
      )}
    </Card>
  );
}
