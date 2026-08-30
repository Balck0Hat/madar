import { Map as MapIcon, Trophy, User, Search, BarChart3, Users } from "lucide-react";
import { C, FONT, alpha, T, R, S, TAP, BP } from "../../constants/theme";
import { paths } from "../../../app/routes";
import OrbitMark from "./OrbitMark";

// ترتيب التنقل. mobile: يظهر في الشريط السفلي (خمسة أقسام كحد أقصى)،
// والإحصاءات تُفتح من صفحة «أنا» على الهاتف كي لا يزدحم الشريط.
export const NAV = [
  { k: paths.home, label: "الخريطة", Icon: MapIcon, mobile: true },
  { k: paths.search, label: "بحث", Icon: Search, mobile: true },
  { k: paths.league, label: "الترتيب", Icon: Trophy, mobile: true },
  { k: paths.friends, label: "الأصدقاء", Icon: Users, mobile: true },
  { k: paths.me, label: "أنا", Icon: User, mobile: true },
  { k: paths.stats, label: "إحصاءاتي", Icon: BarChart3 },
];

const MOBILE = NAV.filter((n) => n.mobile);

// شريط سفلي للهاتف
export function TabBar({ path, onGo }) {
  return (
    <nav aria-label="التنقل الرئيسي" className="madar-hide-lg" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: BP.phone, background: alpha(C.bg, 0.92), backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 20,
      // الشريط مثبَّت في القاع وviewport-fit=cover يمدّ الصفحة تحت خطّ الإيماءة
      paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {MOBILE.map(({ k, label, Icon }) => (
        <button key={k} type="button" onClick={() => onGo(k)} aria-current={path === k ? "page" : undefined} style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: `${S.lg}px ${S.xs}px ${S.x2}px`, color: path === k ? C.gold : C.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: S.xs, minHeight: TAP, fontFamily: FONT, fontSize: T.xs, fontWeight: path === k ? 700 : 500 }}>
          <Icon size={20} /><span style={{ whiteSpace: "nowrap" }}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// شريط جانبي للشاشات الكبيرة
export function SideNav({ path, onGo, name }) {
  return (
    <nav aria-label="التنقل الرئيسي" className="madar-side">
      <div style={{ display: "flex", alignItems: "center", gap: S.xl, padding: `0 ${S.lg}px ${S.x3}px` }}>
        <OrbitMark size={34} />
        <div><div style={{ fontWeight: 700, fontSize: T.x3, lineHeight: 1 }}>مدار</div><div style={{ color: C.muted, fontSize: T.xs, marginTop: S.xs }}>افهم كل شيء</div></div>
      </div>
      {NAV.map(({ k, label, Icon }) => (
        <button key={k} type="button" onClick={() => onGo(k)} aria-current={path === k ? "page" : undefined} className="madar-press" style={{ display: "flex", alignItems: "center", gap: S.xl, background: path === k ? C.goldSoft : "transparent", border: `1px solid ${path === k ? alpha(C.gold, 0.33) : "transparent"}`, borderRadius: R.lg, padding: `${S.xl}px ${S.x2}px`, color: path === k ? C.gold : C.text, cursor: "pointer", fontFamily: FONT, fontSize: T.md, fontWeight: path === k ? 700 : 600, textAlign: "start" }}>
          <Icon size={19} />{label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      {name && <div style={{ color: C.muted, fontSize: T.sm, padding: `0 ${S.xl}px` }}>{name}</div>}
    </nav>
  );
}
