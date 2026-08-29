import { useState, useEffect, useRef, useCallback } from "react";

// قراءة صوتية عبر Web Speech API.
// لماذا هوك مشترك: المتصفحات تحمّل الأصوات بشكل غير متزامن (voiceschanged)،
// وتترك النطق شغّالاً بعد مغادرة الصفحة ما لم نُلغِه يدوياً — فنجمع العلاج في مكان واحد.
export function useSpeech() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const supported = Boolean(synth && typeof window.SpeechSynthesisUtterance === "function");
  const [speaking, setSpeaking] = useState(false);
  const voice = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    // نختار أول صوت عربي متاح، وإن لم يوجد نترك الصوت الافتراضي للمتصفح
    const pick = () => {
      const list = synth.getVoices?.() || [];
      voice.current = list.find((v) => String(v.lang || "").toLowerCase().startsWith("ar")) || null;
    };
    pick();
    if (synth.addEventListener) synth.addEventListener("voiceschanged", pick);
    else synth.onvoiceschanged = pick;
    return () => {
      if (synth.removeEventListener) synth.removeEventListener("voiceschanged", pick);
      else synth.onvoiceschanged = null;
      synth.cancel(); // لا نترك صوتاً يكمل بعد اختفاء الشاشة
    };
  }, [supported, synth]);

  const stop = useCallback(() => {
    if (!supported) return;
    synth.cancel();
    setSpeaking(false);
  }, [supported, synth]);

  const speak = useCallback((text) => {
    const said = String(text || "").trim();
    if (!supported || !said) return;
    synth.cancel(); // دائماً نلغي ما قبله: صفوف النطق في المتصفحات تتراكم ولا تُستبدل
    const utter = new window.SpeechSynthesisUtterance(said);
    if (voice.current) utter.voice = voice.current;
    utter.lang = voice.current?.lang || "ar-SA";
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utter);
  }, [supported, synth]);

  return { supported, speaking, speak, stop };
}
