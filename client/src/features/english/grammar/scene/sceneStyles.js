// حركات مشهد العالم: انسياب الشلال، توهّج المصابيح، طفو الجزر، انجراف الغيوم، لمعان الماء.
// transform وopacity وstroke-dashoffset فقط؛ تُعطَّل مع «تقليل الحركة» بقاعدة madar العامة.
const CSS = `
@keyframes sceneFall{from{stroke-dashoffset:0}to{stroke-dashoffset:-40}}
@keyframes sceneGlow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes sceneFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes sceneDrift{from{transform:translateX(-30px)}to{transform:translateX(30px)}}
@keyframes sceneShimmer{0%,100%{opacity:.25}50%{opacity:.6}}
@keyframes sceneSail{0%{transform:translateX(0)}50%{transform:translateX(26px) translateY(-3px)}100%{transform:translateX(0)}}
.scene-fall{stroke-dasharray:14 12;animation:sceneFall 1.6s linear infinite}
.scene-glow{animation:sceneGlow 3s ease-in-out infinite}
.scene-float{animation:sceneFloat 7s ease-in-out infinite}
.scene-drift{animation:sceneDrift 40s ease-in-out infinite alternate}
.scene-shimmer{animation:sceneShimmer 4s ease-in-out infinite}
.scene-sail{animation:sceneSail 12s ease-in-out infinite}
.scene-chip{transition:transform .15s ease,box-shadow .15s ease}
.scene-chip:hover{transform:translate(-50%,-50%) scale(1.06)}
.scene-chip:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.scene-fall,.scene-glow,.scene-float,.scene-drift,.scene-shimmer,.scene-sail{animation:none!important}}`;

let injected = false;
export function ensureSceneStyles() {
  if (injected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-madar-scene", "");
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
}
