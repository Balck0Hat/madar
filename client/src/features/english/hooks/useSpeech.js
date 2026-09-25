import { useCallback, useEffect, useRef, useState } from "react";

// قراءة نصّ الاستماع بصوت المتصفح (مجاناً، بلا خادم). صوت إنجليزي بريطاني أو
// أمريكي إن وُجد، وإلا أي صوت إنجليزي. الحوار يُقرأ سطراً سطراً بصوتين إن أمكن.
const pickVoices = () => {
  const all = typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices() : [];
  const en = all.filter((v) => /^en(-|_)/i.test(v.lang));
  const gb = en.filter((v) => /GB|UK/i.test(v.lang) || /British|UK/i.test(v.name));
  const us = en.filter((v) => /US/i.test(v.lang) || /United States|American/i.test(v.name));
  return { a: gb[0] || en[0] || null, b: us[0] || en[1] || en[0] || null };
};

export function useSpeech() {
  const [state, setState] = useState("idle"); // idle | playing | done | unsupported
  const [line, setLine] = useState(-1);
  const queue = useRef([]);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => { if (supported) speechSynthesis.cancel(); queue.current = []; setState("idle"); setLine(-1); }, [supported]);

  const play = useCallback((lines, { rate = 0.95 } = {}) => {
    if (!supported) { setState("unsupported"); return; }
    speechSynthesis.cancel();
    const voices = pickVoices();
    setState("playing");
    lines.forEach((l, i) => {
      const u = new SpeechSynthesisUtterance(l.text);
      u.lang = "en-GB"; u.rate = rate;
      const v = l.who === "Man" ? voices.b : voices.a;
      if (v) u.voice = v;
      u.onstart = () => setLine(i);
      if (i === lines.length - 1) u.onend = () => { setState("done"); setLine(-1); };
      queue.current.push(u);
      speechSynthesis.speak(u);
    });
  }, [supported]);

  useEffect(() => () => { if (supported) speechSynthesis.cancel(); }, [supported]);
  return { state, line, play, stop, supported };
}
