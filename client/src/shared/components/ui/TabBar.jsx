import { Map as MapIcon, Trophy, User } from "lucide-react";
import { C, FONT } from "../../constants/theme";

const ITEMS = [["map", "الخريطة", MapIcon], ["league", "الترتيب", Trophy], ["me", "أنا", User]];

export default function TabBar({ tab, onTab }) {
  return (
    <nav aria-label="التنقل الرئيسي" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(11,16,32,.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 20 }}>
      {ITEMS.map(([k, label, I]) => (
        <button key={k} type="button" onClick={() => onTab(k)} aria-current={tab === k ? "page" : undefined} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 14px", color: tab === k ? C.gold : C.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: tab === k ? 800 : 500 }}>
          <I size={22} />{label}
        </button>
      ))}
    </nav>
  );
}
