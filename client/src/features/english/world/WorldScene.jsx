import { useEffect, useRef, useState } from "react";
import { C, S, alpha } from "../../../shared/constants/theme";

const SKY_IMAGE = "/maps/journey/sky.webp";
const SKY_FALLBACK = "#1d2a63"; // لون الفضاء في الصورة، يظهر قبل تحميلها

// المشهد: خلفية سماء مرسومة (جزر عائمة وكواكب) مثبّتة على الشاشة داخل حدود المشهد،
// تنزلق ببطء من أعلى الصورة إلى أسفلها كلما تقدّمت في الرحلة. فوقها طبقة الجزر مائلة بمنظور ثلاثي الأبعاد.
// الهاتف: إمالة خفيفة. الحاسوب: أكبر وتميل مع الماوس. مع «تقليل الحركة»: مسطحة، والخلفية تبقى مثبّتة بلا انزلاق.
export default function WorldScene({ children, desktop, reduced, focusY = null }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [view, setView] = useState({ offset: 0, progress: 0, vh: typeof window === "undefined" ? 800 : window.innerHeight });
  const box = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    const measure = () => {
      raf.current = null;
      const el = box.current; if (!el) return;
      const r = el.getBoundingClientRect(); const vh = window.innerHeight;
      const room = Math.max(0, r.height - vh);
      const offset = Math.min(room, Math.max(0, -r.top));
      setView({ offset, progress: room ? offset / room : 0, vh });
    };
    const on = () => { if (!raf.current) raf.current = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);
  const onMove = (e) => { if (!desktop || reduced) return; const r = e.currentTarget.getBoundingClientRect(); setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }); };
  const tilt = reduced ? 0 : desktop ? 9 : 5; // إمالة خفيفة: أكثر منها يطمس النصّ ويقصّ الأطراف
  const rotX = tilt + (desktop ? -mouse.y * 3 : 0), rotY = desktop ? mouse.x * 3 : 0;
  const posY = reduced ? 50 : Math.round(view.progress * 100);
  return (
    <div ref={box} onMouseMove={onMove} style={{ position: "relative", overflow: "hidden", borderRadius: 24, background: SKY_FALLBACK, minHeight: 320 }}>
      <div aria-hidden="true" style={{ position: "absolute", insetInline: 0, top: 0, height: view.vh, transform: `translateY(${view.offset}px)`, backgroundImage: `url(${SKY_IMAGE})`, backgroundSize: "cover", backgroundPosition: `50% ${posY}%`, backgroundRepeat: "no-repeat", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, transparent 40%, ${alpha("#000", 0.35)} 100%)` }} />
      </div>
      <div style={{ position: "relative", perspective: reduced ? "none" : desktop ? "1400px" : "900px", perspectiveOrigin: "50% 30%", padding: desktop ? `${S.x7}px ${S.x7}px ${S.x8}px` : `${S.x5}px ${S.x2}px ${S.x7}px` }}>
        <div className="world-scene" style={{ transform: reduced ? "none" : `rotateX(${rotX}deg) rotateY(${rotY}deg)${focusY !== null ? ` translateY(${-focusY}px)` : ""}`, transformOrigin: "50% 50%" }}>
          {children}
        </div>
      </div>
      <div aria-hidden="true" style={{ position: "absolute", insetInline: 0, bottom: 0, height: 60, background: `linear-gradient(transparent, ${alpha(C.bg, 0.35)})`, pointerEvents: "none" }} />
    </div>
  );
}
