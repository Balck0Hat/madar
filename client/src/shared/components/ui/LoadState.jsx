import { C } from "../../constants/theme";
import Btn from "./Btn";

// هيكل تحميل + حالة خطأ مع إعادة محاولة، لكل الشاشات التي تجلب بيانات
export function Skeleton({ lines = 4, paper = false }) {
  const bg = paper ? "rgba(30,34,53,0.08)" : C.surface2;
  return (
    <div aria-busy="true" aria-live="polite" style={{ display: "grid", gap: 10, padding: "8px 0" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="madar-tw" style={{ height: i === 0 ? 120 : 16, borderRadius: i === 0 ? 18 : 8, background: bg, width: i === 0 ? "100%" : `${90 - (i % 3) * 18}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry, onBack }) {
  return (
    <div role="alert" style={{ background: C.red + "1f", border: `1px solid ${C.red}66`, borderRadius: 16, padding: 16, display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 800 }}>تعذّر التحميل</div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{message}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {onRetry && <Btn primary small full={false} onClick={onRetry}>أعد المحاولة</Btn>}
        {onBack && <Btn ghost small full={false} onClick={onBack}>عودة</Btn>}
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 16px", display: "grid", gap: 8, justifyItems: "center" }}>
      <div style={{ fontSize: 40 }} aria-hidden="true">✦</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
      {text && <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>{text}</div>}
      {action && <Btn primary small full={false} onClick={onAction}>{action}</Btn>}
    </div>
  );
}
