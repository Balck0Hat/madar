import { WifiOff, AlertTriangle } from "lucide-react";
import { C, P, alpha } from "../../constants/theme";
import Spot from "../art/Spot";
import Btn from "./Btn";

// هيكل تحميل + حالة خطأ مع إعادة محاولة، لكل الشاشات التي تجلب بيانات

// اللمعة تُحقن هنا لا في global.js لأنها خاصة بهذا المكوّن؛
// نحرّك تدرّجاً شفافاً فوق لون السطح ليقرأ صحيحاً في السمتين دون ألوان ثابتة.
const SHIMMER_CSS = `
@keyframes madarShim{from{background-position:180% 0}to{background-position:-80% 0}}
.madar-shim{animation:madarShim 1.5s linear infinite}
@media (prefers-reduced-motion:reduce){.madar-shim{animation:none}}
`;

export function Skeleton({ lines = 4, paper = false }) {
  // على الورق يكون السطح فاتحاً فاللمعة أفتح منه، وفي الواجهة الداكنة تعتمد على لون النص
  const base = paper ? alpha(P.ink, 0.08) : C.surface2;
  const shine = paper ? alpha(P.card, 0.9) : alpha(C.text, 0.09);
  return (
    <div aria-busy="true" aria-live="polite" style={{ display: "grid", gap: 10, padding: "8px 0" }}>
      <style>{SHIMMER_CSS}</style>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="madar-shim"
          style={{
            height: i === 0 ? 120 : 16,
            borderRadius: i === 0 ? 18 : 8,
            width: i === 0 ? "100%" : `${90 - (i % 3) * 18}%`,
            background: base,
            backgroundImage: `linear-gradient(90deg, transparent 15%, ${shine} 50%, transparent 85%)`,
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}
    </div>
  );
}

// انقطاع الشبكة ليس عطلاً في التطبيق: نميّزه بأيقونة ونبرة مختلفة حتى لا يظنّ المتعلم أن شيئاً تعطّل
const NET_RE = /الشبكة|الاتصال|اتصال|الإنترنت/;

export function ErrorState({ message, onRetry, onBack }) {
  const offline = NET_RE.test(String(message || ""));
  const tone = offline ? C.gold : C.red;
  const Icon = offline ? WifiOff : AlertTriangle;
  return (
    <div
      role="alert"
      style={{
        background: alpha(tone, 0.12),
        border: `1px solid ${alpha(tone, 0.4)}`,
        borderRadius: 16,
        padding: 16,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} color={tone} aria-hidden="true" />
        {offline ? "لا يوجد اتصال" : "تعذّر التحميل"}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{message}</div>
      {offline && (
        <div style={{ fontSize: 13, lineHeight: 1.7, color: C.muted }}>
          تحقّق من اتصالك بالإنترنت ثم أعد المحاولة؛ ما أنجزته محفوظ.
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {onRetry && <Btn primary small full={false} onClick={onRetry}>أعد المحاولة</Btn>}
        {onBack && <Btn ghost small full={false} onClick={onBack}>عودة</Btn>}
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action, onAction, spot }) {
  return (
    <div className="madar-rise" style={{ textAlign: "center", padding: "36px 16px", display: "grid", gap: 8, justifyItems: "center" }}>
      {/* بدون spot نُبقي العلامة القديمة حتى لا تتغيّر الشاشات التي لم تُحدَّث بعد */}
      {spot ? <Spot k={spot} size={140} /> : <div style={{ fontSize: 40, color: C.gold }} aria-hidden="true">✦</div>}
      <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
      {text && <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>{text}</div>}
      {action && <Btn primary small full={false} onClick={onAction}>{action}</Btn>}
    </div>
  );
}
