import { Languages, ChevronLeft } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";

// مدخل قسم اللغات من الخريطة
export default function EnglishEntry({ onOpen }) {
  return (
    <div style={{ padding: `${S.lg}px ${S.x4}px 0` }}>
      <Card onClick={onOpen} accent={C.gold} style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <Languages size={22} color={C.gold} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.lg }}>اللغات · الإنجليزية</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>حدّد مستواك في 25 دقيقة، ثم آيلتس وتوفل</div>
        </div>
        <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
      </Card>
    </div>
  );
}
