import { useCallback, useEffect, useRef, useState } from "react";

// الميكروفون → عيّنات خام 16 كيلوهرتز 16 بت، قطعةً كل نحو نصف ثانية. نأخذ الصوت
// من AudioWorklet لا من MediaRecorder: خدمة التعرّف تريد عيّنات لا ملفات مضغوطة،
// وقطع webm المتتابعة لا تُفكّ مستقلةً.
const WORKLET = `
class PcmTap extends AudioWorkletProcessor {
  constructor() { super(); this.buf = []; this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) { this.buf.push(Float32Array.from(ch)); this.n += ch.length; if (this.n >= sampleRate / 2) { const out = new Float32Array(this.n); let o = 0; for (const b of this.buf) { out.set(b, o); o += b.length; } this.port.postMessage(out, [out.buffer]); this.buf = []; this.n = 0; } }
    return true;
  }
}
registerProcessor("pcm-tap", PcmTap);`;

// إعادة أخذ عيّنات بسيطة إلى 16 كيلوهرتز ثم 16 بت
function toPcm16k(float32, fromRate) {
  const ratio = fromRate / 16000;
  const n = Math.floor(float32.length / ratio);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, float32[Math.floor(i * ratio)]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function useRecorder(onChunk) {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const refs = useRef({});
  const cb = useRef(onChunk);
  cb.current = onChunk;

  const stop = useCallback(() => {
    const r = refs.current;
    r.node?.disconnect(); r.src?.disconnect();
    r.stream?.getTracks().forEach((t) => t.stop());
    r.ctx?.close().catch(() => {});
    refs.current = {};
    setRecording(false); setLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("المتصفح لا يتيح الميكروفون هنا. افتح الموقع عبر https."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" })));
      const src = ctx.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(ctx, "pcm-tap");
      node.port.onmessage = (e) => {
        const f = e.data;
        let sum = 0; for (let i = 0; i < f.length; i += 16) sum += f[i] * f[i];
        setLevel(Math.min(1, Math.sqrt(sum / (f.length / 16)) * 6));
        cb.current?.(toPcm16k(f, ctx.sampleRate).buffer);
      };
      src.connect(node);
      refs.current = { stream, ctx, src, node };
      setRecording(true);
    } catch (err) {
      setError(err.name === "NotAllowedError" ? "رُفض الإذن بالميكروفون. اسمح به من إعدادات المتصفح." : `تعذّر فتح الميكروفون: ${err.message}`);
    }
  }, []);

  useEffect(() => stop, [stop]);
  return { recording, level, error, start, stop };
}
