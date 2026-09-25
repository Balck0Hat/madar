// توليد ملفات الاستماع مرة واحدة من نصوص placement/listening.js بأصوات عصبية
// (edge-tts، بلا مفتاح)، بريطانية أو أمريكية بحسب accent، وصوتان للحوار.
//   node scripts/english-audio.js [id …]      (بلا معاملات: كل النصوص التي لا ملف لها)
//   node scripts/english-audio.js --force     (يعيد توليد الكل)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../../client/public/audio/english");
const VOICES = {
  gb: { Man: "en-GB-RyanNeural", Woman: "en-GB-SoniaNeural", Speaker: "en-GB-SoniaNeural" },
  us: { Man: "en-US-ChristopherNeural", Woman: "en-US-JennyNeural", Speaker: "en-US-GuyNeural" },
};
const RATE = { A2: "-8%", B1: "-4%" }; // أبطأ قليلاً للمبتدئين، وطبيعي لما فوق
const GAP = 0.7; // ثوانٍ صمت بين السطور

const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(" ")}: ${r.stderr || r.stdout}`); };

function synth(script, tmp) {
  const parts = [];
  script.lines.forEach((l, i) => {
    const f = path.join(tmp, `${i}.mp3`);
    run("python3", ["-m", "edge_tts", "--voice", VOICES[script.accent][l.who], `--rate=${RATE[script.level] || "+0%"}`, "--text", l.text, "--write-media", f]);
    parts.push(f);
  });
  const silence = path.join(tmp, "gap.mp3");
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(GAP), "-c:a", "libmp3lame", "-b:a", "48k", silence]);
  const list = path.join(tmp, "list.txt");
  fs.writeFileSync(list, parts.flatMap((p, i) => (i ? [silence, p] : [p])).map((p) => `file '${p}'`).join("\n"));
  const out = path.join(OUT, `${script.id}.mp3`);
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "48k", out]);
  return out;
}

const { default: scripts } = await import("../shared/data/english/placement/listening.js");
const args = process.argv.slice(2);
const force = args.includes("--force");
const wanted = args.filter((a) => !a.startsWith("--"));
fs.mkdirSync(OUT, { recursive: true });
for (const s of scripts) {
  const out = path.join(OUT, `${s.id}.mp3`);
  if (wanted.length ? !wanted.includes(s.id) : !force && fs.existsSync(out)) continue;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "madar-tts-"));
  try {
    synth(s, tmp);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`✓ ${s.id} (${s.level} ${s.accent}, ${s.lines.length} lines) → ${kb} KB`);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
