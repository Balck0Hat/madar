import { Landmark, ChevronLeft } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";

// مدخل قسم الشخصيات من الخريطة: الشريط السفلي ممتلئ بخمسة أقسام، فالبطاقة هنا بابه على الهاتف
export default function FiguresEntry({ onOpen }) {
  return (
    <div style={{ padding: `${S.x3}px ${S.x4}px 0` }}>
      <Card onClick={onOpen} accent={C.gold} style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <Landmark size={22} color={C.gold} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.lg }}>الشخصيات</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>من شكّلوا التاريخ: قصة كل واحد، بمستويين للقراءة</div>
        </div>
        <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
      </Card>
    </div>
  );
}
