import { empty, addDevice, toggleLink, togglePower, setIp, route, conflicts } from "./lab.logic";

// سيناريوهات جاهزة: كل واحد يبني حالة ابتدائية ويصف هدفاً، ويفحص هل تحقق
const build = (steps) => steps.reduce((s, fn) => fn(s), empty());
const link = (a, b) => (s) => toggleLink(s, a, b).state;
const add = (kind, x, y) => (s) => addDevice(s, kind, x, y);

export const SCENARIOS = [
  {
    id: "first", title: "أول شبكة", goal: "وصّل الحاسوب والهاتف بالراوتر حتى يأخذا عنوانين، ثم أرسل رزمة من الحاسوب إلى الهاتف.",
    build: () => build([add("router", 50, 30), add("pc", 22, 72), add("phone", 78, 72)]),
    check: (s) => route(s, "pc-1", "phone-1").ok,
  },
  {
    id: "internet", title: "اخرج إلى الإنترنت", goal: "أضف الإنترنت ووصله بالراوتر، ثم أرسل رزمة من الهاتف إلى الإنترنت.",
    build: () => build([add("router", 50, 34), add("phone", 24, 74), link("phone-1", "router-1")]),
    check: (s) => s.devices.some((d) => d.kind === "internet") && route(s, "phone-1", "internet-1").ok,
  },
  {
    id: "switch", title: "مكتب صغير", goal: "ثلاثة حواسيب وخادم لا يكفيها الراوتر؛ استعمل سويتشاً يجمعها ثم أرسل من كل حاسوب إلى الخادم.",
    build: () => build([add("router", 50, 18), add("switch", 50, 50), add("pc", 14, 82), add("pc", 38, 82), add("pc", 62, 82), add("server", 86, 82)]),
    check: (s) => ["pc-1", "pc-2", "pc-3"].every((p) => route(s, p, "server-1").ok),
  },
  {
    id: "outage", title: "الشبكة انقطعت", goal: "شيء مطفأ. اعثر عليه وأعد تشغيله حتى يصل الحاسوب إلى الإنترنت.",
    build: () => build([add("router", 50, 30), add("switch", 30, 60), add("pc", 14, 86), add("internet", 86, 30), link("pc-1", "switch-1"), link("switch-1", "router-1"), link("router-1", "internet-1"), (s) => togglePower(s, "switch-1")]),
    check: (s) => route(s, "pc-1", "internet-1").ok,
  },
  {
    id: "conflict", title: "تعارض عناوين", goal: "جهازان يحملان العنوان نفسه يدوياً. صحّح أحدهما (أو أعده تلقائياً) ثم أرسل رزمة إلى الخادم.",
    build: () => build([add("router", 50, 30), add("pc", 20, 76), add("server", 80, 76), link("pc-1", "router-1"), link("server-1", "router-1"), (s) => setIp(s, "pc-1", "192.168.1.50"), (s) => setIp(s, "server-1", "192.168.1.50")]),
    check: (s) => conflicts(s).length === 0 && route(s, "pc-1", "server-1").ok,
  },
];
export const scenarioOf = (id) => SCENARIOS.find((x) => x.id === id) || SCENARIOS[0];
