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

// المقاييس مستخرَجة من الاستعمال القائم لا مفروضة عليه. ثم رُفع طرفه الأدنى
// بكسلاً واحداً: أكثر حجمين في التطبيق كانا 12 و13، وهما صغيران على العربية
// التي تحمل تشكيل الحرف في تفاصيل دقيقة. ما فوق 18 لم يُمسّ، فزاد الفارق
// بين المتن والعنوان بدل أن يكبر كل شيء معاً.
export const T = { xs: 12, sm: 13, base: 14, md: 15, lg: 16, xl: 17, x2: 18, x3: 20, x4: 22, x5: 26, hero: 40, display: 68 };

// أنصاف الأقطار: 6,7→8 · 22→20 · 99 و999 توحّدتا في pill
export const R = { xs: 4, sm: 8, md: 10, lg: 12, xl: 14, x2: 16, x3: 18, x4: 20, pill: 999 };

// المسافات: كانت الوحيدة خارج المقياس — أكثر من ثلاثين قيمة حشو، وثلاثتها
// المتجاورة 9 و10 و11 تفصلها بكسل واحد بلا سبب. سلّم من اثنتي عشرة درجة
// يغطّي الاستعمال كلّه، والقيم الشاذّة شُدّت إلى أقرب درجة (الانزياح ≤ 2px).
export const S = { xs: 2, sm: 4, md: 6, lg: 8, xl: 10, x2: 12, x3: 14, x4: 16, x5: 20, x6: 24, x7: 32, x8: 40, x9: 56 };

// حافة الشاشة: قيمة واحدة. كانت 16 و18 و20 و22 و24 بحسب الشاشة، فالنص
// يزحف أفقياً عند كل انتقال بين شاشتين.
export const GUTTER = S.x4;

// أصغر هدف يُصاب بالإبهام. كان مضبوطاً في Btn وحده، وبقيت أدوات القراءة
// (32) وشريط الاستئناف (34) وتبويبات المكتبة (40) والأزرار الصغيرة (0) دونه.
export const TAP = 44;

// نقاط الانكسار مسمّاة بدورها في التخطيط لا بأرقامها
// colMax: عرض عمود القائمة على سطح المكتب — بدونه يتمدّد الصفّ إلى 888px
export const BP = { phone: 430, desk: 900, narrowDesk: 1180, focusMax: 820, appMax: 1120, colMax: 680 };

// خط الواجهة، وخط قراءة للدرس، وخط أرقام
export const FONT = '"Readex Pro","Noto Sans Arabic","SF Arabic","Segoe UI",Tahoma,sans-serif';
export const READ = '"Noto Naskh Arabic","SF Arabic",Georgia,serif';
export const MONO = '"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace';

export const inputStyle = {
  width: "100%",
  background: C.surface2,
  border: `1px solid ${C.line}`,
  borderRadius: R.xl,
  padding: `${S.x3}px ${S.x4}px`,
  color: C.text,
  fontSize: T.xl,
  fontFamily: FONT,
};
