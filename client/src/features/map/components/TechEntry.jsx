import { Cpu, ChevronLeft } from "lucide-react";
import { C, T, S } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/ui";

// مدخل قسم التقنية من الخريطة
export default function TechEntry({ onOpen }) {
  return (
    <div style={{ padding: `${S.lg}px ${S.x4}px 0` }}>
      <Card onClick={onOpen} accent={C.gold} style={{ display: "flex", alignItems: "center", gap: S.x2 }}>
        <Cpu size={22} color={C.gold} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: T.lg }}>التقنية</div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>العتاد والأنظمة والشبكات والبرمجة والأمن والذكاء الاصطناعي، بثلاثة مستويات</div>
        </div>
        <ChevronLeft size={18} color={C.muted} aria-hidden="true" />
      </Card>
    </div>
  );
}
