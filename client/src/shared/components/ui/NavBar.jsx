import { Map as MapIcon, Trophy, User, Search, BarChart3, Users } from "lucide-react";
import { C, FONT, alpha } from "../../constants/theme";
import OrbitMark from "./OrbitMark";

// عناصر التنقل: الثلاثة الأولى تظهر على الهاتف، والبقية في الشريط الجانبي
export const NAV = [
  { k: "map", label: "الخريطة", Icon: MapIcon, mobile: true },
  { k: "league", label: "الترتيب", Icon: Trophy, mobile: true },
  { k: "me", label: "أنا", Icon: User, mobile: true },
  { k: "search", label: "بحث", Icon: Search },
  { k: "stats", label: "إحصاءاتي", Icon: BarChart3 },
  { k: "friends", label: "الأصدقاء", Icon: Users },
];

// شريط سفلي للهاتف
export function TabBar({ tab, onTab }) {
  return (
    <nav aria-label="التنقل الرئيسي" className="madar-hide-lg" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: alpha(C.bg, 0.92), backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 20 }}>
      {NAV.filter((n) => n.mobile).map(({ k, label, Icon }) => (
        <button key={k} type="button" onClick={() => onTab(k)} aria-current={tab === k ? "page" : undefined} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 14px", color: tab === k ? C.gold : C.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: tab === k ? 800 : 500 }}>
          <Icon size={22} />{label}
        </button>
      ))}
    </nav>
  );
}

// شريط جانبي للشاشات الكبيرة
export function SideNav({ tab, onTab, name }) {
  return (
    <nav aria-label="التنقل الرئيسي" className="madar-side">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 14px" }}>
        <OrbitMark size={34} />
        <div><div style={{ fontWeight: 900, fontSize: 20, lineHeight: 1 }}>مدار</div><div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>افهم كل شيء</div></div>
      </div>
      {NAV.map(({ k, label, Icon }) => (
        <button key={k} type="button" onClick={() => onTab(k)} aria-current={tab === k ? "page" : undefined} className="madar-press" style={{ display: "flex", alignItems: "center", gap: 10, background: tab === k ? C.goldSoft : "transparent", border: `1px solid ${tab === k ? alpha(C.gold, 0.33) : "transparent"}`, borderRadius: 12, padding: "11px 12px", color: tab === k ? C.gold : C.text, cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: tab === k ? 800 : 600, textAlign: "start" }}>
          <Icon size={19} />{label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {name && <div style={{ color: C.muted, fontSize: 12, padding: "0 10px" }}>{name}</div>}
    </nav>
  );
}
