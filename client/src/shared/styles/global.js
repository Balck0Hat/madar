// متغيرات السمة والحركات والتخطيط المتجاوب؛ تُحقن مرة واحدة من App
export const CSS = `
:root, [data-theme="dark"] {
  --bg:#0B1020; --surface:#141B33; --surface2:#1B2444; --line:#26304F;
  --text:#F2EFE6; --muted:#8C93AD; --gold:#F2B544; --gold-soft:rgba(242,181,68,.16);
  --green:#3FB68B; --red:#F26B5B;
  --paper-bg:#F3EBDD; --paper-ink:#1E2235; --paper-muted:#6B6F80; --paper-line:#DDD2BE;
  --paper-panel:#0B1020; --paper-card:#FBF7EE; --paper-gold:#A9781A;
  --shadow:0 10px 30px rgba(0,0,0,.45);
  color-scheme: dark;
}
[data-theme="light"] {
  --bg:#F7F4EC; --surface:#FFFDF7; --surface2:#EFE9DC; --line:#DFD6C4;
  --text:#1B2033; --muted:#6A7086; --gold:#A9781A; --gold-soft:rgba(169,120,26,.14);
  --green:#1F8A63; --red:#C4432F;
  --paper-bg:#FFFDF7; --paper-ink:#1B2033; --paper-muted:#6A7086; --paper-line:#E4DCCB;
  --paper-panel:#1B2033; --paper-card:#F6F1E5; --paper-gold:#A9781A;
  --shadow:0 10px 30px rgba(27,32,51,.14);
  color-scheme: light;
}
html { -webkit-text-size-adjust: 100%; }
.madar { font-size: calc(1rem * var(--font-scale, 1)); }
.madar *{box-sizing:border-box}
.madar input,.madar textarea,.madar button,.madar select{font-family:inherit}
.madar input:focus,.madar textarea:focus,.madar button:focus-visible,.madar select:focus-visible,.madar [role=button]:focus-visible,.madar a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.madar ::selection{background:var(--gold-soft)}

/* التخطيط: عمود واحد على الهاتف، وعمودان وشريط جانبي على الشاشات الكبيرة */
.madar-app{display:flex;justify-content:center;min-height:100vh}
.madar-main{width:100%;max-width:430px;min-height:100vh;position:relative}
.madar-side{display:none}
.madar-wide{display:contents}
@media (min-width:900px){
  .madar-app{gap:0}
  .madar-main{max-width:1120px;padding-inline-start:232px;padding-bottom:0}
  .madar-main.is-focus{max-width:820px;padding-inline-start:0}
  .madar-side{display:flex;position:fixed;inset-block:0;inset-inline-start:calc(50% - 560px);width:216px;flex-direction:column;gap:6px;padding:22px 14px;border-inline-end:1px solid var(--line);background:var(--surface)}
  .madar-wide{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:22px;align-items:start;padding:0 16px}
  .madar-wide > *{min-width:0}
  .madar-read{max-width:70ch;margin-inline:auto}
  .madar-hide-lg{display:none !important}
}
@media (min-width:900px) and (max-width:1180px){
  .madar-side{inset-inline-start:0}
  .madar-main{margin-inline-start:0}
}

/* حركات */
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
  .madar-pulse,.madar-draw,.madar-spin,.madar-in,.madar-tw,.madar-shake,.madar-conf,.madar-pop,.madar-slide,.madar-rise,.madar-stagger > *,.madar-press{animation:none;transition:none}
}
`;
