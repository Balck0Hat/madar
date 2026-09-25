import { Hourglass, Zap, FolderKanban, BookOpen } from "lucide-react";
import { C, R, alpha } from "../../../shared/constants/theme";

// رمز الغلاف أيقونة مرسومة لا إيموجي: الإيموجي مربّع فارغ على أجهزة بلا خط رموز
const ICONS = { "⏳": Hourglass, "⚡": Zap, "🗂️": FolderKanban };

// غلاف صغير: لون الكتاب ورمزه، بنسبة كتاب حقيقي. العنوان بجانبه لا فوقه: نصّ فوق لون مشبع لا يقرأ في السمتين
export default function BookCover({ book, width = 72 }) {
  const color = book.cover?.color || C.gold;
  return (
    <div aria-hidden="true" style={{ width, height: Math.round(width * 1.4), flexShrink: 0, borderRadius: R.md, background: `linear-gradient(160deg, ${alpha(color, 0.95)}, ${alpha(color, 0.6)})`, boxShadow: "var(--shadow-2)", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", insetInlineStart: 0, top: 0, bottom: 0, width: Math.max(4, Math.round(width * 0.07)), background: alpha("#000", 0.18) }} />
      {(() => { const Icon = ICONS[book.cover?.glyph] || BookOpen; return <Icon size={Math.round(width * 0.42)} color={C.bg} strokeWidth={1.6} aria-hidden="true" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))" }} />; })()}
    </div>
  );
}
