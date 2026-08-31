import { BP, S } from "../constants/theme";

// متغيرات السمة والحركات والتخطيط المتجاوب؛ تُحقن مرة واحدة من App
export const CSS = `
:root, [data-theme="dark"] {
  --bg:#0B1020; --surface:#141B33; --surface2:#1B2444; --line:#2C3760;
  --text:#F2EFE6; --muted:#8C93AD; --gold:#F2B544; --gold-soft:rgba(242,181,68,.16);
  --green:#3FB68B; --red:#F26B5B;
  /* الورق يتبع السمة أيضاً. كان كريمياً في الوضعين، فالوضع الداكن كان يتوقف
     عند باب الدرس: من يقرأ ليلاً تنفتح في وجهه صفحة فاتحة بملء الشاشة —
     وهي الشاشة التي يقضي فيها معظم وقته. الحبر أبيض دافئ لا ناصع، والصفحة
     أفتح قليلاً من خلفية التطبيق لتبقى «ورقة» موضوعة فوقها لا امتداداً لها. */
  --paper-bg:#151A28; --paper-ink:#E9E4D8; --paper-muted:#8C93AD; --paper-line:#2E3648;
  --paper-panel:#0E1320; --paper-card:#1C2233; --paper-gold:#F2B544;
  /* لمعة الهيكل تسير نحو الأفتح، وهي جهة تنقلب مع السمة فلا تُشتق من الحبر */
  --paper-shine:rgba(233,228,216,.14);
  --shadow-1:0 1px 2px rgba(0,0,0,.35);
  --shadow-2:0 6px 18px rgba(0,0,0,.40);
  --shadow-3:0 18px 48px rgba(0,0,0,.55);
  --shadow:var(--shadow-2);
  color-scheme: dark;
}
/* الوضع الفاتح ليس قلباً للداكن: الذهبي والأخضر والرمادي أُعيد ضبطها لأن
   نفس الصبغة التي تلمع على كحلي تبهت على كريمي. القيم مختارة لتقرأ فوق
   الخلفية والسطحين معاً، لا فوق أفتحها وحده. */
[data-theme="light"] {
  --bg:#F7F4EC; --surface:#FFFDF7; --surface2:#EFE9DC; --line:#D3C7AF;
  --text:#1B2033; --muted:#61667A; --gold:#8A610F; --gold-soft:rgba(138,97,15,.14);
  --green:#1A7352; --red:#B33D2B;
  --paper-bg:#FFFDF7; --paper-ink:#1B2033; --paper-muted:#64697E; --paper-line:#DED4C0;
  --paper-panel:#1B2033; --paper-card:#F6F1E5; --paper-gold:#8A610F;
  --paper-shine:rgba(255,255,255,.9);
  --shadow-1:0 1px 2px rgba(27,32,51,.08);
  --shadow-2:0 6px 18px rgba(27,32,51,.12);
  --shadow-3:0 18px 48px rgba(27,32,51,.20);
  --shadow:var(--shadow-2);
  color-scheme: light;
}
html { -webkit-text-size-adjust: 100%; }
/* ارتفاع سطر أساسي: لم يكن هناك واحد، فكل مكوّن يقرّر لنفسه وتسع قيم
   متفرّقة تحكم النصّ. العربية تحتاج سطراً أوسع من اللاتينية لتنفّس التشكيل. */
.madar { font-size: calc(1rem * var(--font-scale, 1)); line-height: 1.6; }
.madar *{box-sizing:border-box}
.madar input,.madar textarea,.madar button,.madar select{font-family:inherit}
.madar input:focus,.madar textarea:focus,.madar button:focus-visible,.madar select:focus-visible,.madar [role=button]:focus-visible,.madar a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.madar ::selection{background:var(--gold-soft)}

/* التخطيط: عمود واحد على الهاتف، وعمودان وشريط جانبي على الشاشات الكبيرة */
/* viewport-fit=cover يمدّ الصفحة تحت النتوء وشريط الإيماءة عمداً، فلا بد من
   ردّ المسافة هنا؛ بدونها يقع شريط التنقّل تحت الخطّ الأبيض على آيفون. */
.madar-app{display:flex;justify-content:center;min-height:100vh;
  padding-inline:env(safe-area-inset-left,0px) env(safe-area-inset-right,0px)}
.madar-main{width:100%;max-width:${BP.phone}px;min-height:100vh;position:relative;
  padding-top:env(safe-area-inset-top,0px)}
.madar-side{display:none}
.madar-wide{display:contents}
/* خلوص الشريط السفلي: رقم واحد بدل تسعين مكرَّرة في ستّ شاشات، ويزيد بمقدار
   منطقة الأمان على الأجهزة التي لها واحدة، ويسقط على سطح المكتب حيث لا شريط. */
.madar-tabpad{padding-bottom:calc(90px + env(safe-area-inset-bottom,0px))}
@media (min-width:${BP.desk}px){
  .madar-app{gap:0}
  .madar-main{max-width:${BP.appMax}px;padding-inline-start:232px;padding-bottom:0}
  .madar-main.is-focus{max-width:${BP.focusMax}px;padding-inline-start:0}
  .madar-tabpad{padding-bottom:${S.x6}px}
  /* قائمة بطاقات على عرض 888px تصير أشرطة رفيعة فارغة الوسط. عمود القراءة
     يبقى بعرض معقول، وهو ما يفصل تطبيقاً مصمَّماً عن تطبيق هاتف مكبَّر. */
  .madar-col{max-width:${BP.colMax}px;margin-inline:auto}
  .madar-side{display:flex;position:fixed;inset-block:0;inset-inline-start:calc(50% - 560px);width:216px;flex-direction:column;gap:6px;padding:22px 14px;border-inline-end:1px solid var(--line);background:var(--surface)}
  .madar-wide{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:22px;align-items:start;padding:0 16px}
  .madar-wide > *{min-width:0}
  .madar-read{max-width:70ch;margin-inline:auto}
  .madar-hide-lg{display:none !important}
}
@media (min-width:${BP.desk}px) and (max-width:${BP.narrowDesk}px){
  .madar-side{inset-inline-start:0}
  .madar-main{margin-inline-start:0}
}

/* حركات */
@keyframes madarTrace{from{stroke-dashoffset:1;opacity:0}20%{opacity:1}to{stroke-dashoffset:0;opacity:1}}
.madar-trace{stroke-dasharray:1;animation:madarTrace 1s ease-out both}
@keyframes madarFlash{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
.madar-flash{animation:madarFlash .5s ease-out}
.madar-lift{transition:transform .16s ease, box-shadow .16s ease}
@media (hover:hover){.madar-lift:hover{transform:translateY(-2px);box-shadow:var(--shadow-2)}}
@keyframes madarFadeIn{from{opacity:0}to{opacity:1}}
.madar-fade{animation:madarFadeIn .3s ease-out}
@keyframes madarPulse{0%,100%{opacity:.25}50%{opacity:1}}
.madar-pulse{animation:madarPulse 2.2s ease-in-out infinite}
@keyframes madarDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.madar-draw{stroke-dasharray:1;stroke-dashoffset:0;animation:madarDraw 1.4s ease-out}
@keyframes madarSpin{to{transform:rotate(360deg)}}
.madar-spin{animation:madarSpin 40s linear infinite;transform-origin:50% 50%}
@keyframes madarIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.madar-in{animation:madarIn .35s ease-out}
@keyframes madarTwinkle{0%,100%{opacity:.25}50%{opacity:1}}
.madar-tw{animation:madarTwinkle 3.2s ease-in-out infinite}
@keyframes madarShake{0%,100%{transform:none}25%{transform:translateX(7px)}75%{transform:translateX(-7px)}}
.madar-shake{animation:madarShake .38s ease}
@keyframes madarFall{0%{transform:translateY(-12vh) rotate(0)}100%{transform:translateY(112vh) rotate(720deg)}}
.madar-conf{position:absolute;top:0;animation:madarFall 2.6s cubic-bezier(.3,.6,.4,1) forwards}
@keyframes madarPop{0%{transform:scale(.2);opacity:0}70%{transform:scale(1.5)}100%{transform:scale(1);opacity:1}}
.madar-pop{animation:madarPop .7s ease-out both}
.madar-seg path{transition:fill-opacity .9s ease}
@keyframes madarSlide{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
.madar-slide{animation:madarSlide .3s ease-out}
@keyframes madarRise{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.madar-rise{animation:madarRise .45s cubic-bezier(.2,.7,.3,1) both}
.madar-stagger > *{animation:madarRise .45s cubic-bezier(.2,.7,.3,1) both}
.madar-stagger > *:nth-child(2){animation-delay:.05s}
.madar-stagger > *:nth-child(3){animation-delay:.1s}
.madar-stagger > *:nth-child(4){animation-delay:.15s}
.madar-stagger > *:nth-child(5){animation-delay:.2s}
.madar-press{transition:transform .12s ease}
.madar-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){
  /* شامل لا مُعدَّد: القائمة السابقة كانت تفوتها الانتقالات المكتوبة داخل
     المكوّنات، فتظل الواجهة تتحرّك عند من طلب إيقاف الحركة. */
  .madar *,.madar *::before,.madar *::after{
    animation-duration:.01ms !important;animation-iteration-count:1 !important;
    transition-duration:.01ms !important;scroll-behavior:auto !important}
}
`;
