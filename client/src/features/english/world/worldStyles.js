// حركات عالم القواعد: طفو الجزر، رسم المسار، نبض مهمة اليوم، انكسار القفل، وبناء الجسر.
// كلها على transform وopacity وstroke فقط، وتُعطَّل كلها مع «تقليل الحركة».
const CSS = `
@keyframes worldFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes worldFloatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes worldDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes worldQuest{0%,100%{box-shadow:0 0 0 0 var(--gold)}50%{box-shadow:0 0 0 12px transparent}}
@keyframes worldUnlock{0%{transform:scale(1) rotate(0)}30%{transform:scale(1.25) rotate(-12deg)}60%{transform:scale(.9) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
@keyframes worldRise{from{opacity:0;transform:translateY(18px) scale(.9)}to{opacity:1;transform:none}}
@keyframes worldCloud{from{transform:translateX(-8%)}to{transform:translateX(8%)}}
@keyframes worldFog{0%,100%{opacity:.75}50%{opacity:.6}}
@keyframes worldWalk{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.world-float{animation:worldFloat 6s ease-in-out infinite}
.world-float-slow{animation:worldFloatSlow 9s ease-in-out infinite}
.world-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:worldDraw 1.2s ease-out forwards}
.world-quest{animation:worldQuest 2.4s ease-out infinite}
.world-unlock{animation:worldUnlock .6s cubic-bezier(.3,1.4,.5,1) both}
.world-rise{animation:worldRise .5s cubic-bezier(.2,.7,.3,1) both}
.world-cloud{animation:worldCloud 40s ease-in-out infinite alternate}
.world-fog{animation:worldFog 5s ease-in-out infinite}
.world-walk{animation:worldWalk 1.2s ease-in-out infinite}
.world-scene{transition:transform .45s cubic-bezier(.2,.7,.3,1)}
.world-node{transition:transform .25s ease,filter .25s ease}
.world-node:focus-visible{outline:3px solid var(--gold);outline-offset:4px}
@media (prefers-reduced-motion:reduce){
  .world-float,.world-float-slow,.world-draw,.world-quest,.world-unlock,.world-rise,.world-cloud,.world-fog,.world-walk{animation:none!important;stroke-dashoffset:0!important;opacity:1!important}
  .world-scene,.world-node{transition:none!important}
}`;

let injected = false;
export function ensureWorldStyles() {
  if (injected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-madar-world", "");
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
}
