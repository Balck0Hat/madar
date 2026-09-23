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

@app.post("/transcribe")
async def transcribe(req: Request):
    raw = await req.body()
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if audio.size < 1600:  # أقل من عُشر ثانية
        return {"text": "", "seconds": 0}
    feats = proc(audio, sampling_rate=16000, return_tensors="pt").input_features
    t = time.time()
    with lock, torch.no_grad():
        ids = model.generate(feats, max_new_tokens=200)
    text = proc.batch_decode(ids, skip_special_tokens=True)[0].strip()
    return {"text": text, "seconds": round(audio.size / 16000, 1), "ms": int((time.time() - t) * 1000)}
