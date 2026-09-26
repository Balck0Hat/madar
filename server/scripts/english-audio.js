// توليد ملفات الاستماع مرة واحدة بأصوات عصبية (edge-tts، بلا مفتاح)، بريطانية أو
// أمريكية بحسب accent، وأصوات مختلفة للمتحدثين. يشمل نصوص اختبار المستوى
// (placement/listening.js) وأقسام الاستماع في وحدات المسارات (tracks/*/listening-*.js).
//   node scripts/english-audio.js [id …]      (بلا معاملات: كل ما لا ملف له)
//   node scripts/english-audio.js --force     (يعيد توليد الكل)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../../client/public/audio/english");
const VOICES = {
  gb: { Man: "en-GB-RyanNeural", Woman: "en-GB-SoniaNeural", Man2: "en-GB-ThomasNeural", Woman2: "en-GB-LibbyNeural", Speaker: "en-GB-SoniaNeural" },
  us: { Man: "en-US-ChristopherNeural", Woman: "en-US-JennyNeural", Man2: "en-US-EricNeural", Woman2: "en-US-AriaNeural", Speaker: "en-US-GuyNeural" },
};
const RATE = { A2: "-8%", B1: "-4%" }; // أبطأ قليلاً للمبتدئين، وطبيعي لما فوق
const GAP = 0.7; // ثوانٍ صمت بين السطور

const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(" ")}: ${r.stderr || r.stdout}`); };

function synth(job, tmp) {
  const parts = [];
  job.lines.forEach((l, i) => {
    const f = path.join(tmp, `${i}.mp3`);
    run("python3", ["-m", "edge_tts", "--voice", VOICES[job.accent][l.who] || VOICES[job.accent].Speaker, `--rate=${RATE[job.level] || "+0%"}`, "--text", l.text, "--write-media", f]);
    parts.push(f);
  });
  const silence = path.join(tmp, "gap.mp3");
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(GAP), "-c:a", "libmp3lame", "-b:a", "48k", silence]);
  const list = path.join(tmp, "list.txt");
  fs.writeFileSync(list, parts.flatMap((p, i) => (i ? [silence, p] : [p])).map((p) => `file '${p}'`).join("\n"));
  const out = path.join(OUT, `${job.file}.mp3`);
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "48k", out]);
  return out;
}

// كل ما يُقرأ صوتياً: نصوص اختبار المستوى بمعرّفها، وأقسام الوحدات باسم <module>-<section>
async function jobs() {
  const { default: scripts } = await import("../shared/data/english/placement/listening.js");
  const { MODULES } = await import("../shared/data/english/tracks/index.js");
  const out = scripts.map((s) => ({ file: s.id, accent: s.accent, level: s.level, lines: s.lines }));
  for (const m of Object.values(MODULES).flat()) for (const s of m.sections) if (s.lines) out.push({ file: `${m.id}-${s.id}`, accent: s.accent || "gb", level: null, lines: s.lines });
  return out;
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const wanted = args.filter((a) => !a.startsWith("--"));
fs.mkdirSync(OUT, { recursive: true });
for (const j of await jobs()) {
  const out = path.join(OUT, `${j.file}.mp3`);
  if (wanted.length ? !wanted.includes(j.file) : !force && fs.existsSync(out)) continue;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "madar-tts-"));
  try {
    synth(j, tmp);
    console.log(`✓ ${j.file} (${j.accent}, ${j.lines.length} lines) → ${Math.round(fs.statSync(out).size / 1024)} KB`);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
