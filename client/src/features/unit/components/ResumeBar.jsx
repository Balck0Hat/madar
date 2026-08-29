import { BookmarkCheck } from "lucide-react";
import { C, P, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const action = (fill) => ({
  fontFamily: "inherit", fontWeight: 800, fontSize: ".8em", cursor: "pointer",
  borderRadius: 10, padding: "7px 12px", minHeight: 34,
  background: fill ? C.gold : "transparent",
  color: fill ? "#141B33" : P.muted,
  border: `1px solid ${fill ? "transparent" : P.line}`,
});

// شريط غير معترض للقراءة: نُعلم القارئ بموضعه المحفوظ ونترك له القرار.
// لا نقفز تلقائياً لأن القفز يربك من فتح الوحدة قاصداً البدء من أولها.
export default function ResumeBar({ card, total, onResume, onRestart }) {
  const num = useNum();
  return (
    <div className="madar-in" role="status" style={{
      margin: "8px 16px 0", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      background: alpha(C.gold, 0.14), border: `1px solid ${alpha(C.gold, 0.5)}`, borderRadius: 14, padding: "8px 10px",
    }}>
      <BookmarkCheck size={16} color={P.gold} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 130, fontSize: ".8em", lineHeight: 1.6, color: P.ink }}>
        تابع من حيث توقفت <span style={{ color: P.muted }}>· صفحة {num(card + 1)} من {num(total)}</span>
      </span>
      <button type="button" onClick={onResume} style={action(true)}>تابع</button>
      <button type="button" onClick={onRestart} style={action(false)}>من البداية</button>
    </div>
  );
}
