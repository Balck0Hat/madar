"""خدمة التعرّف على التلاوة: نموذج Whisper المدرَّب على القرآن (Tarteel، مجاني) على
محرّك CTranslate2 (int8) يعمل على المعالج محلياً بنحو ثلاثة أضعاف سرعة PyTorch.
يستقبل صوتاً خاماً PCM 16 بت 16 كيلوهرتز ويعيد النص بالتشكيل.
تشغيل: uvicorn app:app --host 127.0.0.1 --port 3106   (تحت pm2 باسم madar-asr)
التحويل: ct2-transformers-converter --model tarteel-ai/whisper-base-ar-quran --output_dir models/tarteel-base-ct2 --quantization int8
"""
import os, time, threading
import numpy as np
from fastapi import FastAPI, Request
from faster_whisper import WhisperModel

MODEL = os.environ.get("ASR_MODEL", os.path.join(os.path.dirname(__file__), "models", "tarteel-base-ct2"))
THREADS = int(os.environ.get("ASR_THREADS", "8"))
app = FastAPI()
lock = threading.Lock()  # نموذج واحد، طلب واحد في المرة: أبسط وأثبت من التوازي على المعالج
t0 = time.time()
model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=THREADS)
print(f"[asr] {MODEL} loaded in {time.time()-t0:.1f}s", flush=True)

FRAME = 480  # 30 مللي ثانية
MIN_SPEECH = 0.5  # ثوانٍ من الكلام الفعلي قبل أن نستمع

# بوابة الصمت: Whisper يخترع كلمات على الصمت والأنفاس («بسم الله…»، «ما السعير»)،
# فلا نعطيه إلا ما فيه صوت، ثم كاشف كلام (VAD) داخل المحرّك يقصّ ما ليس كلاماً.
def voiced_mask(audio):
    n = audio.size // FRAME
    if n == 0: return np.zeros(0, bool), 0.0
    rms = np.sqrt((audio[: n * FRAME].reshape(n, FRAME) ** 2).mean(axis=1))
    floor = np.percentile(rms, 10)
    thresh = float(np.clip(floor * 2.5, 0.008, 0.015))
    return rms > thresh, thresh

def trim(audio):
    mask, _ = voiced_mask(audio)
    if not mask.any(): return audio[:0], 0.0
    idx = np.flatnonzero(mask)
    a, b = max(0, idx[0] - 8) * FRAME, min(len(mask), idx[-1] + 8) * FRAME  # ربع ثانية هامش
    return audio[a:b], mask.sum() * FRAME / 16000

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL, "engine": "ctranslate2-int8"}

@app.post("/transcribe")
async def transcribe(req: Request):
    raw = await req.body()
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    audio, speech = trim(audio)
    if speech < MIN_SPEECH:
        return {"text": "", "seconds": 0, "speech": round(speech, 2)}
    t = time.time()
    with lock:
        segments, _ = model.transcribe(audio, language="ar", beam_size=1, without_timestamps=True, condition_on_previous_text=False,
                                       vad_filter=True, vad_parameters={"min_silence_duration_ms": 400, "speech_pad_ms": 200})
        text = " ".join(s.text for s in segments).strip()
    return {"text": text, "seconds": round(audio.size / 16000, 1), "speech": round(speech, 2), "ms": int((time.time() - t) * 1000)}
