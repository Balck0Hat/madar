import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// تصحيح الكتابة عبر Claude Code المثبّت على الخادم باشتراك صاحب الموقع (لا مفتاح API).
// يعمل في مجلد فارغ حتى لا يحمّل تعليمات المشروع، بلا أدوات، دورة واحدة، ومخرجات JSON.
// طلب واحد في المرة: الاشتراك شخصي والموقع لمستخدم واحد.
const CWD = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", ".grader");
const BIN = process.env.CLAUDE_BIN || "claude";
const MODEL = process.env.GRADER_MODEL || "claude-sonnet-5";
const TIMEOUT = 180000;

let chain = Promise.resolve();

function runOnce(prompt) {
  return new Promise((resolve, reject) => {
    // بلا أدوات إطلاقاً ووضع «خطة» فلا ينفّذ شيئاً مهما حاول نصّ الطالب أن يوجّهه؛ المجلد فارغ ولا تعليمات مشروع
    const args = ["-p", "--output-format", "json", "--max-turns", "1", "--tools", "", "--disallowedTools", "Bash,Read,Write,Edit,MultiEdit,WebFetch,WebSearch,Task,Agent,NotebookEdit", "--permission-mode", "plan", "--model", MODEL, "--no-session-persistence"];
    const child = spawn(BIN, args, { cwd: CWD, env: { ...process.env, HOME: process.env.HOME || "/root" }, stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("grader timeout")); }, TIMEOUT);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`grader exit ${code}: ${err.slice(0, 300)}`));
      try { resolve(JSON.parse(out)); } catch { reject(new Error(`grader bad output: ${out.slice(0, 200)}`)); }
    });
    child.stdin.end(prompt);
  });
}

// يعيد نصّ الردّ؛ وإن طُلب JSON يقتطع أول كائن JSON في الردّ
export function ask(prompt) {
  const job = chain.then(() => runOnce(prompt));
  chain = job.catch(() => {});
  return job.then((r) => String(r.result || ""));
}

// نصّ الطالب يُغلَّف بعلامات ويُعامَل كبيانات: التعليمات قبله لا بعده
export const wrapUserText = (label, text) => `<${label}>\n${String(text).replace(/<\/?[a-z_]+>/gi, "")}\n</${label}>`;

export async function askJson(prompt) {
  const text = await ask(prompt);
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("grader returned no JSON");
  return JSON.parse(m[0]);
}
