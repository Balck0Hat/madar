// منطق مختبر «ابنِ شبكتك»: أجهزة وروابط، توزيع عناوين تلقائي (DHCP) من الراوتر، وإيجاد مسار الرزمة.
// نقي بلا React كي يُختبر وحده. الحالة: { devices: [{ id, kind, x, y, on, ip? }], links: [[a, b]] }.
export const KINDS = {
  pc: { label: "حاسوب", ends: true }, phone: { label: "هاتف", ends: true }, server: { label: "خادم", ends: true },
  switch: { label: "سويتش" }, router: { label: "راوتر" }, internet: { label: "الإنترنت", ends: true, publicIp: "8.8.8.8" },
};
export const LAN = "192.168.1.";
export const empty = () => ({ devices: [], links: [] });
const byId = (s, id) => s.devices.find((d) => d.id === id);
const neighbours = (s, id) => s.links.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

export function addDevice(s, kind, x = 50, y = 50) {
  if (!KINDS[kind]) throw new Error(`نوع غير معروف: ${kind}`);
  if (kind === "internet" && s.devices.some((d) => d.kind === "internet")) return s;
  const n = s.devices.filter((d) => d.kind === kind).length + 1;
  return assign({ ...s, devices: [...s.devices, { id: `${kind}-${n}`, kind, x, y, on: true }] });
}
export const removeDevice = (s, id) => assign({ devices: s.devices.filter((d) => d.id !== id), links: s.links.filter(([a, b]) => a !== id && b !== id) });
export const moveDevice = (s, id, x, y) => ({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, x, y } : d)) });
export const togglePower = (s, id) => assign({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, on: !d.on } : d)) });
export const setIp = (s, id, ip) => ({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, ip: ip || undefined, manual: !!ip } : d)) });

// وصل/فصل: لا وصل ذاتي، ولا تكرار؛ الإنترنت لا يتصل إلا براوتر
export function toggleLink(s, a, b) {
  if (a === b) return { state: s, error: "لا يمكن وصل الجهاز بنفسه" };
  const has = s.links.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (has) return { state: assign({ ...s, links: s.links.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a))) }) };
  const da = byId(s, a), db = byId(s, b);
  if ([da, db].some((d) => d.kind === "internet") && ![da, db].some((d) => d.kind === "router")) return { state: s, error: "الإنترنت لا يصل إلا إلى راوتر (عبر المودم)" };
  if (KINDS[da.kind].ends && KINDS[db.kind].ends) return { state: assign({ ...s, links: [...s.links, [a, b]] }), warn: "وصل جهازين مباشرة يعمل، لكن بلا راوتر لا عناوين تلقائية ولا إنترنت" };
  return { state: assign({ ...s, links: [...s.links, [a, b]] }) };
}

// هل يصل الجهاز إلى راوتر يعمل عبر سويتشات تعمل؟ (البحث بالعرض داخل الشبكة المحلية فقط)
const reachesRouter = (s, id) => {
  const seen = new Set([id]); const q = [id];
  while (q.length) { const cur = q.shift(); for (const n of neighbours(s, cur)) { const d = byId(s, n); if (!d || !d.on || seen.has(n)) continue; if (d.kind === "router") return true; if (d.kind === "switch") { seen.add(n); q.push(n); } } }
  return false;
};

// DHCP: الراوتر يأخذ .1 والأجهزة المتصلة به تأخذ .10 فصاعداً بترتيب إضافتها؛ العناوين اليدوية تبقى
export function assign(s) {
  let next = 10;
  const devices = s.devices.map((d) => {
    if (d.manual) return d;
    if (d.kind === "internet") return { ...d, ip: KINDS.internet.publicIp };
    if (d.kind === "router") return { ...d, ip: d.on ? `${LAN}1` : undefined };
    if (d.kind === "switch") return { ...d, ip: undefined };
    return { ...d, ip: d.on && reachesRouter(s, d.id) ? `${LAN}${next++}` : undefined };
  });
  return { ...s, devices };
}
export const conflicts = (s) => { const seen = {}; for (const d of s.devices) if (d.ip) (seen[d.ip] ||= []).push(d.id); return Object.entries(seen).filter(([, ids]) => ids.length > 1).map(([ip, ids]) => ({ ip, ids })); };

// مسار الرزمة من جهاز إلى آخر: أقصر طريق عبر أجهزة تعمل. الخروج إلى الإنترنت يمرّ بالراوتر حتماً.
export function route(s, from, to) {
  const src = byId(s, from), dst = byId(s, to);
  if (!src || !dst) return { ok: false, reason: "اختر جهازين" };
  if (!src.on) return { ok: false, reason: `${label(src)} مطفأ` };
  if (!src.ip) return { ok: false, reason: `${label(src)} بلا عنوان IP: لا يصل إلى راوتر يعمل` };
  if (!dst.ip) return { ok: false, reason: `${label(dst)} بلا عنوان IP، فلا يمكن مخاطبته` };
  const dup = conflicts(s).find((c) => c.ip === dst.ip);
  if (dup) return { ok: false, reason: `تعارض: ${dup.ids.length} أجهزة تحمل ${dst.ip}؛ الرزمة قد تصل الجهاز الخطأ`, conflict: dup };
  const prev = { [from]: null }; const q = [from];
  while (q.length) {
    const cur = q.shift();
    if (cur === to) { const path = []; for (let c = to; c !== null; c = prev[c]) path.unshift(c); return { ok: true, path, hops: path.length - 1 }; }
    for (const n of neighbours(s, cur)) { const d = byId(s, n); if (d && d.on && !(n in prev)) { prev[n] = cur; q.push(n); } }
  }
  const off = s.devices.find((d) => !d.on && ["router", "switch"].includes(d.kind));
  return { ok: false, reason: off ? `${label(off)} مطفأ فانقطع الطريق` : "لا طريق يصل بين الجهازين: تحقق من الروابط" };
}
export const label = (d) => `${KINDS[d.kind].label} ${d.id.split("-")[1]}`;
