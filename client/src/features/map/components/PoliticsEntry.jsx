import { Scale, ChevronLeft } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";

// مدخل قسم السياسة من الخريطة، بجوار مدخل الشخصيات
export default function PoliticsEntry({ onOpen }) {
  return (
    <div style={{ padding: `${S.lg}px ${S.x4}px 0` }}>
      <Card onClick={onOpen} accent={C.gold} style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <Scale size={22} color={C.gold} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.lg }}>السياسة</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>الدول ومن يحكمها الآن، والألقاب وأصل كل كلمة، وأنواع الحكم</div>
        </div>
        <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
      </Card>
    </div>
  );
}
