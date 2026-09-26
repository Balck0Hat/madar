import { useEffect, useRef, useState } from "react";
import { C, S, alpha } from "../../../shared/constants/theme";
import { skyOf } from "./worldLayout";

const SKY = {
  day: { top: "#8fc3ff", bottom: "#dff1ff" },
  dusk: { top: "#5b4a8a", bottom: "#f2b27a" },
  night: { top: "#0b1020", bottom: "#1b2444" },
};

// المشهد: سماء تتبع ساعة الجهاز، سحب تتحرك، وطبقة الجزر مائلة بمنظور ثلاثي الأبعاد.
// الهاتف: الإمالة 35 درجة والطبقات تتحرك مع التمرير. الحاسوب: 50 درجة وتميل مع الماوس.
// مع «تقليل الحركة»: مسطحة بلا ميلان ولا سحب متحركة.
export default function WorldScene({ children, desktop, reduced, focusY = null }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scroll, setScroll] = useState(0);
  const raf = useRef(null);
  const sky = SKY[skyOf(new Date().getHours())];
  useEffect(() => {
    if (reduced) return undefined;
    const on = () => { if (!raf.current) raf.current = requestAnimationFrame(() => { raf.current = null; setScroll(window.scrollY); }); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [reduced]);
  const onMove = (e) => { if (!desktop || reduced) return; const r = e.currentTarget.getBoundingClientRect(); setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }); };
  const tilt = reduced ? 0 : desktop ? 9 : 5; // إمالة خفيفة: أكثر منها يطمس النصّ ويقصّ الأطراف
  const rotX = tilt + (desktop ? -mouse.y * 3 : 0), rotY = desktop ? mouse.x * 3 : 0;
  const isNight = sky === SKY.night;
  return (
    <div onMouseMove={onMove} style={{ position: "relative", overflow: "hidden", borderRadius: 24, background: `linear-gradient(${sky.top}, ${sky.bottom})`, minHeight: 320 }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, transform: reduced ? undefined : `translateY(${scroll * 0.15}px)` }}>
        {isNight && Array.from({ length: 18 }, (_, i) => <span key={i} className="madar-twinkle" style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, width: 2, height: 2, borderRadius: 2, background: "#fff", opacity: 0.7, animationDelay: `${(i % 5) * 400}ms` }} />)}
        {[0, 1, 2].map((i) => (
          <svg key={i} className={reduced ? undefined : "world-cloud"} viewBox="0 0 120 40" width={desktop ? 220 : 140} aria-hidden="true" style={{ position: "absolute", left: `${10 + i * 30}%`, top: `${6 + i * 9}%`, opacity: isNight ? 0.12 : 0.55, animationDelay: `${i * -13}s`, animationDuration: `${34 + i * 9}s` }}>
            <ellipse cx="40" cy="26" rx="34" ry="12" fill="#fff" /><ellipse cx="66" cy="20" rx="30" ry="14" fill="#fff" /><ellipse cx="88" cy="28" rx="26" ry="10" fill="#fff" />
          </svg>
        ))}
      </div>
      <div style={{ perspective: reduced ? "none" : desktop ? "1400px" : "900px", perspectiveOrigin: "50% 30%", padding: desktop ? `${S.x7}px ${S.x7}px ${S.x8}px` : `${S.x5}px ${S.x2}px ${S.x7}px` }}>
        <div className="world-scene" style={{ transform: reduced ? "none" : `rotateX(${rotX}deg) rotateY(${rotY}deg)${focusY !== null ? ` translateY(${-focusY}px)` : ""}`, transformOrigin: "50% 50%" }}>
          {children}
        </div>
      </div>
      <div aria-hidden="true" style={{ position: "absolute", insetInline: 0, bottom: 0, height: 60, background: `linear-gradient(transparent, ${alpha(C.bg, 0.35)})`, pointerEvents: "none" }} />
    </div>
  );
}
