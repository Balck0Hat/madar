import dns from "node:dns/promises";
import { spawn } from "node:child_process";
import { AppError } from "../../shared/utils/AppError.js";

// أدوات شبكة حيّة من خادم مدار: حلّ DNS، عنوان الزائر العام، نبضة لقياس الكمون، وتتبّع المسار عبر mtr.
// الاسم يُتحقق منه بصرامة ويُمرَّر كوسيط مستقل (لا صدفة) فلا تُحقن أوامر.
const HOST = /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;
const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
export const validHost = (h) => HOST.test(h) || IPV4.test(h);
const bad = (m) => new AppError(m, 400, "TOOL_BAD_INPUT");

const settle = (p) => p.then((v) => v).catch(() => null);

// كل السجلات الشائعة مع مدة الصلاحية حيث تتاح
export async function lookup(name) {
  const host = String(name || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  if (!HOST.test(host)) throw bad("اكتب اسم نطاق صحيحاً مثل example.com");
  const t0 = Date.now();
  const [a, aaaa, cname, mx, ns, txt] = await Promise.all([
    settle(dns.resolve4(host, { ttl: true })), settle(dns.resolve6(host, { ttl: true })), settle(dns.resolveCname(host)), settle(dns.resolveMx(host)), settle(dns.resolveNs(host)), settle(dns.resolveTxt(host)),
  ]);
  if (!a && !aaaa && !cname) throw new AppError("لم يُعثر على هذا الاسم", 404, "DNS_NOT_FOUND");
  return {
    host, ms: Date.now() - t0,
    a: (a || []).map((r) => ({ address: r.address, ttl: r.ttl })), aaaa: (aaaa || []).map((r) => ({ address: r.address, ttl: r.ttl })),
    cname: cname || [], mx: (mx || []).sort((x, y) => x.priority - y.priority).map((m) => ({ exchange: m.exchange, priority: m.priority })), ns: ns || [], txt: (txt || []).map((t) => t.join("")).slice(0, 5),
  };
}

const isPrivate = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.|::1$|fc|fd|fe80)/i.test(ip);

// عنوان الزائر كما وصل للخادم (خلف nginx: أول عنوان في X-Forwarded-For)
export function whoami(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = (fwd || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");
  return { ip, family: ip.includes(":") ? "IPv6" : "IPv4", private: isPrivate(ip), agent: String(req.headers["user-agent"] || "").slice(0, 120), server: "madar.sajidibdah.com" };
}

// تتبّع المسار: mtr بتقرير نصي، قفزة واحدة لكل سطر. المهلة 25 ثانية.
export async function trace(target) {
  const host = String(target || "").trim().toLowerCase();
  if (!validHost(host)) throw bad("اكتب اسم نطاق أو عنوان IPv4 صحيحاً");
  return new Promise((resolve, reject) => {
    const child = spawn("mtr", ["-n", "-r", "-c", "1", "-m", "20", "-w", host], { timeout: 25000 });
    let out = "", err = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => reject(new AppError(`تعذّر تشغيل التتبّع: ${e.message}`, 500, "TRACE_FAILED")));
    child.on("close", () => {
      const hops = out.split("\n").filter((l) => /^\s*\d+\.\|--/.test(l)).map((l) => {
        const m = l.match(/^\s*(\d+)\.\|--\s+(\S+)\s+([\d.]+)%?\s+\d+\s+([\d.]+)\s+([\d.]+)/);
        return m ? { hop: Number(m[1]), ip: m[2] === "???" ? null : m[2], loss: Number(m[3]), ms: m[2] === "???" ? null : Number(m[5]) } : null;
      }).filter(Boolean);
      if (!hops.length) return reject(new AppError(err.trim() || "لم يرجع التتبّع بشيء", 502, "TRACE_EMPTY"));
      resolve({ host, hops, reached: hops.some((h) => h.ip && (h.ip === host || hops.at(-1).ip === h.ip) && h.loss === 0) });
    });
  });
}
