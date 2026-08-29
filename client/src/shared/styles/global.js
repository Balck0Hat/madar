// أنماط عامة وحركات؛ تُحقن مرة واحدة من App
export const CSS = `
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
@media (prefers-reduced-motion:reduce){.madar-pulse,.madar-draw,.madar-spin,.madar-in,.madar-tw,.madar-shake,.madar-conf,.madar-pop,.madar-slide{animation:none}}
.madar *{box-sizing:border-box}
.madar input,.madar textarea,.madar button{font-family:inherit}
.madar input:focus,.madar textarea:focus,.madar button:focus-visible,.madar [role=button]:focus-visible{outline:2px solid #F2B544;outline-offset:2px}
`;
