import { useEffect, useRef } from "react";

const SETTLE = 300;

// يرصد القسم الذي يقرأه القارئ في وضع التمرير ويبلّغ عنه.
// لماذا شريط رفيع في وسط الشاشة (rootMargin سالب من الطرفين): «القسم الحالي»
// هو ما يقع تحت عين القارئ، لا أول قسم لامس أسفل النافذة.
// ولماذا التأخير: التمرير السريع يعبر أقساماً كثيرة، ولا يصح أن نحفظ كلاً منها.
// وإن غاب IntersectionObserver (متصفح قديم) نصمت تماماً: التمرير يبقى يعمل
// ويضيع حفظ الموضع وحده، وهو أهون من شاشة تنهار.
export function useSectionSpy(hostRef, count, onSection) {
  const cb = useRef(onSection);
  cb.current = onSection;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const nodes = Array.from(host.querySelectorAll("[data-section]"));
    if (!nodes.length) return undefined;

    let timer = 0;
    let last = -1;
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const i = Number(e.target.dataset.section);
        if (e.isIntersecting) seen.add(i); else seen.delete(i);
      });
      if (!seen.size) return;
      const cur = Math.min(...seen);
      if (cur === last) return;
      last = cur;
      clearTimeout(timer);
      timer = setTimeout(() => cb.current?.(cur), SETTLE);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    nodes.forEach((n) => io.observe(n));
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [hostRef, count]);
}
