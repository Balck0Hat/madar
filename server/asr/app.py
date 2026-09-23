"""خدمة التعرّف على التلاوة: نموذج Whisper المدرَّب على القرآن (Tarteel، مجاني) يعمل على
المعالج محلياً. يستقبل صوتاً خاماً PCM 16 بت 16 كيلوهرتز ويعيد النص بالتشكيل.
تشغيل: uvicorn app:app --host 127.0.0.1 --port 3106   (تحت pm2 باسم madar-asr)
"""
import os, time, threading
import numpy as np, torch
from fastapi import FastAPI, Request
from transformers import WhisperProcessor, WhisperForConditionalGeneration

MODEL = os.environ.get("ASR_MODEL", "tarteel-ai/whisper-base-ar-quran")
torch.set_num_threads(int(os.environ.get("ASR_THREADS", "8")))
app = FastAPI()
lock = threading.Lock()  # نموذج واحد، طلب واحد في المرة: أبسط وأثبت من التوازي على المعالج
t0 = time.time()
proc = WhisperProcessor.from_pretrained(MODEL)
model = WhisperForConditionalGeneration.from_pretrained(MODEL).eval()
print(f"[asr] {MODEL} loaded in {time.time()-t0:.1f}s", flush=True)

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL}

FRAME = 480  # 30 مللي ثانية
MIN_SPEECH = 0.4  # ثوانٍ من الكلام الفعلي قبل أن نستمع

# بوابة الصمت: Whisper يخترع كلمات على الصمت والضجيج («بسم الله…»)، فلا نعطيه
# إلا ما فيه صوت. عتبة الطاقة تتكيّف مع أرضية الضجيج في النافذة نفسها.
def voiced_mask(audio):
    n = audio.size // FRAME
    if n == 0: return np.zeros(0, bool), 0.0
    rms = np.sqrt((audio[: n * FRAME].reshape(n, FRAME) ** 2).mean(axis=1))
    # أرضية الضجيج من أهدأ العُشر، والعتبة بينها وبين سقف: التلاوة المتصلة لا صمت فيها
    # فلو تبعنا الأرضية وحدها لعُدّت كلها ضجيجاً
    floor = np.percentile(rms, 10)
    thresh = float(np.clip(floor * 2.5, 0.004, 0.012))
    return rms > thresh, float(thresh)

def trim(audio):
    mask, thresh = voiced_mask(audio)
    if not mask.any(): return audio[:0], 0.0
    idx = np.flatnonzero(mask)
    a, b = max(0, idx[0] - 8) * FRAME, min(len(mask), idx[-1] + 8) * FRAME  # ربع ثانية هامش
    return audio[a:b], mask.sum() * FRAME / 16000

@app.post("/transcribe")
async def transcribe(req: Request):
    raw = await req.body()
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    audio, speech = trim(audio)
    if speech < MIN_SPEECH:
        return {"text": "", "seconds": 0, "speech": round(speech, 2)}
    feats = proc(audio, sampling_rate=16000, return_tensors="pt").input_features
    t = time.time()
    with lock, torch.no_grad():
        ids = model.generate(feats, max_new_tokens=200)
    text = proc.batch_decode(ids, skip_special_tokens=True)[0].strip()
    return {"text": text, "seconds": round(audio.size / 16000, 1), "speech": round(speech, 2), "ms": int((time.time() - t) * 1000)}
