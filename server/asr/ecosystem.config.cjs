// pm2 start asr/ecosystem.config.cjs — خدمة التعرّف على التلاوة، محلية على المنفذ 3106
module.exports = {
  apps: [{
    name: "madar-asr",
    cwd: __dirname,
    script: "/root/.local/bin/uvicorn",
    args: "app:app --host 127.0.0.1 --port 3106",
    interpreter: "none",
    env: { ASR_THREADS: "12" },
    max_memory_restart: "4G",
    autorestart: true,
  }],
};
