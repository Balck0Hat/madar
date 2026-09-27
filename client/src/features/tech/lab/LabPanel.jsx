import { Monitor, Smartphone, Server, Network, Router, Cloud, Power, Trash2, Link2, Send } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { KINDS, label } from "./lab.logic";

const ICON = { pc: Monitor, phone: Smartphone, server: Server, switch: Network, router: Router, internet: Cloud };
const btn = (active, hue) => ({ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.xl, border: `1px solid ${active ? hue : C.line}`, background: active ? alpha(hue, 0.12) : C.surface, color: active ? hue : C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: S.md, cursor: "pointer" });

// شريط الأدوات: إضافة أجهزة، اختيار الوضع (وصل/إرسال)، وفاحص الجهاز المختار
export function Palette({ hue, onAdd, mode, onMode }) {
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div style={{ display: "flex", gap: S.sm, flexWrap: "wrap" }} role="group" aria-label="أضف جهازاً">
        {Object.entries(KINDS).map(([k, v]) => { const Icon = ICON[k]; return <button key={k} type="button" onClick={() => onAdd(k)} style={btn(false, hue)}><Icon size={16} aria-hidden="true" />{v.label}</button>; })}
      </div>
      <div style={{ display: "flex", gap: S.sm }} role="radiogroup" aria-label="الوضع">
        <button type="button" role="radio" aria-checked={mode === "link"} onClick={() => onMode("link")} style={btn(mode === "link", hue)}><Link2 size={16} aria-hidden="true" />وصل: اضغط جهازين</button>
        <button type="button" role="radio" aria-checked={mode === "send"} onClick={() => onMode("send")} style={btn(mode === "send", hue)}><Send size={16} aria-hidden="true" />أرسل رزمة: من ثم إلى</button>
      </div>
    </div>
  );
}

export function Inspector({ device, hue, onPower, onRemove, onIp }) {
  if (!device) return <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>اسحب جهازاً لتحريكه. اضغطه لاختياره ثم اضغط آخر لوصلهما (أو فصلهما).</div>;
  const ends = KINDS[device.kind].ends && device.kind !== "internet";
  return (
    <div style={{ display: "grid", gap: S.lg, background: alpha(hue, 0.06), border: `1px solid ${alpha(hue, 0.3)}`, borderRadius: R.xl, padding: S.x3 }}>
      <div style={{ fontWeight: 700 }}>{label(device)} <span className="madar-num" dir="ltr" style={{ color: C.muted, fontWeight: 400, fontSize: T.sm }}>{device.ip || "بلا عنوان"}</span></div>
      {ends && (
        <label style={{ display: "grid", gap: S.xs, fontSize: T.sm, color: C.muted }}>عنوان يدوي (اتركه فارغاً للتلقائي)
          <input dir="ltr" value={device.manual ? device.ip : ""} placeholder="192.168.1.50" onChange={(e) => onIp(device.id, e.target.value.trim())} inputMode="decimal" style={{ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.lg, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontFamily: "inherit", fontSize: T.md }} />
        </label>
      )}
      <div style={{ display: "flex", gap: S.sm, flexWrap: "wrap" }}>
        {device.kind !== "internet" && <button type="button" onClick={() => onPower(device.id)} style={btn(!device.on, C.red)}><Power size={16} aria-hidden="true" />{device.on ? "أطفئ" : "شغّل"}</button>}
        <button type="button" onClick={() => onRemove(device.id)} style={btn(false, hue)}><Trash2 size={16} aria-hidden="true" />احذف</button>
      </div>
    </div>
  );
}
