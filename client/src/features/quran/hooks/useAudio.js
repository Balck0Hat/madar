import { useCallback, useEffect, useRef, useState } from "react";

// مشغّل واحد للصفحة: آية واحدة تُسمع في المرة، والضغط على نفسها يوقفها
export function useAudio() {
  const el = useRef(null);
  const [current, setCurrent] = useState(null);

  const toggle = useCallback((key, url) => {
    if (!el.current) { el.current = new Audio(); el.current.onended = () => setCurrent(null); el.current.onerror = () => setCurrent(null); }
    const a = el.current;
    if (current === key) { a.pause(); setCurrent(null); return; }
    a.src = url; a.play().catch(() => setCurrent(null)); setCurrent(key);
  }, [current]);

  useEffect(() => () => { el.current?.pause(); }, []);
  return { current, toggle };
}
