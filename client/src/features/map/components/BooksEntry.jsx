import { BookMarked, ChevronLeft } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";

// مدخل رفّ الكتب من الخريطة
export default function BooksEntry({ onOpen }) {
  return (
    <div style={{ padding: `${S.lg}px ${S.x4}px 0` }}>
      <Card onClick={onOpen} accent={C.gold} style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <BookMarked size={22} color={C.gold} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.lg }}>الكتب</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>كتب قصيرة في الوقت والإنتاجية والتنظيم، فصلاً فصلاً وبتمرين في كل فصل</div>
        </div>
        <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
      </Card>
    </div>
  );
}
