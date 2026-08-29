// الألوان تُقرأ من متغيرات CSS ليعمل الوضعان الفاتح والداكن دون تغيير المكوّنات.
// القيم الحرفية في HEX_DARK للمكوّنات التي تُصدَّر صوراً (متغيرات CSS لا تُحلّ داخل PNG).
export const C = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  surface2: "var(--surface2)",
  line: "var(--line)",
  text: "var(--text)",
  muted: "var(--muted)",
  gold: "var(--gold)",
  goldSoft: "var(--gold-soft)",
  green: "var(--green)",
  red: "var(--red)",
};

// لوحة الورق (شاشة الدرس) — تتبدل هي أيضاً مع السمة
export const P = {
  bg: "var(--paper-bg)",
  ink: "var(--paper-ink)",
  muted: "var(--paper-muted)",
  line: "var(--paper-line)",
  panel: "var(--paper-panel)",
  card: "var(--paper-card)",
  gold: "var(--paper-gold)",
};

// قيم حرفية (الوضع الداكن) لبطاقة المشاركة والشهادة عند التصدير كصورة
export const HEX_DARK = {
  bg: "#0B1020", surface: "#141B33", surface2: "#1B2444", line: "#26304F",
  text: "#F2EFE6", muted: "#8C93AD", gold: "#F2B544", green: "#3FB68B", red: "#F26B5B",
};

// شفافية تعمل مع متغيرات CSS ومع الهيكس معاً
export const alpha = (color, amount) => `color-mix(in srgb, ${color} ${Math.round(amount * 100)}%, transparent)`;

// خط الواجهة، وخط قراءة للدرس، وخط أرقام
export const FONT = '"Readex Pro","Noto Sans Arabic","SF Arabic","Segoe UI",Tahoma,sans-serif';
export const READ = '"Noto Naskh Arabic","SF Arabic",Georgia,serif';
export const MONO = '"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace';

export const inputStyle = {
  width: "100%",
  background: C.surface2,
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: "14px 16px",
  color: C.text,
  fontSize: 16,
  fontFamily: FONT,
};
