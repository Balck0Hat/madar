import { Check, Lock, Play } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card } from "../../../shared/components/ui";

export default function UnitRow({ index, title, color, done, authored, locked, onOpen }) {
  const num = useNum();
  const status = done ? `مكتملة · ${num(done.score)}/${num(done.total)}` : authored ? "جاهزة" : "محاكاة";
  return (
    <Card onClick={locked ? undefined : onOpen} style={{ opacity: locked ? 0.55 : 1, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 99, flexShrink: 0, background: done ? color : C.surface2, color: done ? "var(--bg)" : C.muted, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 800, border: `1px solid ${done ? color : C.line}` }}>
          {done ? <Check size={18} /> : num(index + 1)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>{title}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{status}</div>
        </div>
        {locked ? <Lock size={16} color={C.muted} /> : <Play size={16} color={done ? C.muted : color} />}
      </div>
    </Card>
  );
}
