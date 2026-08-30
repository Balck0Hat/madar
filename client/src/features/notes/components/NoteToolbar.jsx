import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, MessageSquarePlus, Trash2, Pencil, X } from "lucide-react";
import { P, C, FONT, READ, alpha, T, R, S } from "../../../shared/constants/theme";
import { tintOf } from "../utils/highlight";
import NoteComposer from "./NoteComposer";

const HALF = 150; // نصف عرض الشريط: نحصر مركزه داخل الشاشة حتى لا يخرج من حافتها

// شريط عائم فوق التحديد. يُركَّب في body عبر بوابة: الصفحة تُحرَّك بـ transform
// أثناء الانتقال، وأي عنصر fixed بداخلها يصير محصوراً بها بدل الشاشة.
export default function NoteToolbar({ sel, onSave, onEdit, onRemove, onClose, busy, err }) {
  const [mode, setMode] = useState("");
  const [draft, setDraft] = useState("");
  const [color, setColor] = useState("gold");

  useEffect(() => {
    setMode("");
    setDraft(sel?.note || "");
    setColor(sel?.color || "gold");
  }, [sel?.id, sel?.text]);

  if (!sel || typeof document === "undefined") return null;
  const below = sel.at.top < 140;
  const style = {
    position: "fixed", zIndex: 60,
    top: below ? Math.round(sel.at.bottom + 10) : Math.round(Math.max(10, sel.at.top - 10)),
    left: Math.round(Math.min(Math.max(sel.at.center, HALF + 8), (window.innerWidth || 360) - HALF - 8)),
    transform: below ? "translateX(-50%)" : "translate(-50%, -100%)",
    width: Math.min(300, (window.innerWidth || 360) - 24),
    background: P.card, color: P.ink, fontFamily: FONT,
    border: `1px solid ${P.line}`, borderRadius: R.x2, padding: S.xl,
    boxShadow: "var(--shadow-2)",
  };

  const existing = Boolean(sel.id);
  return createPortal(
    <div dir="rtl" role="dialog" aria-label="أدوات التظليل" style={style} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", gap: S.md, alignItems: "flex-start", marginBottom: S.lg }}>
        <div style={{ fontFamily: READ, fontSize: T.base, lineHeight: 1.7, color: P.muted, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", borderInlineStart: `3px solid ${tintOf(color)}`, paddingInlineStart: S.lg }}>
          {sel.text}
        </div>
        <button type="button" aria-label="إغلاق" onClick={onClose} style={{ ...icon, color: P.muted }}><X size={15} /></button>
      </div>

      {mode ? (
        <NoteComposer
          value={draft} onChange={setDraft} color={color} onColor={setColor} busy={busy}
          showColors={!existing}
          onCancel={() => (existing ? setMode("") : onClose())}
          onSave={(text) => (existing ? onEdit(text) : onSave(color, text))}
        />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: S.md }}>
          {existing ? (
            <>
              <button type="button" style={action} onClick={() => setMode("edit")}><Pencil size={14} />{sel.note ? "تعديل الملاحظة" : "أضف ملاحظة"}</button>
              <button type="button" disabled={busy} style={{ ...action, color: C.red, background: alpha(C.red, 0.12) }} onClick={onRemove}><Trash2 size={14} />حذف</button>
            </>
          ) : (
            <>
              <button type="button" disabled={busy} style={action} onClick={() => onSave(color, "")}><Highlighter size={14} />تظليل</button>
              <button type="button" style={action} onClick={() => setMode("new")}><MessageSquarePlus size={14} />تظليل مع ملاحظة</button>
            </>
          )}
        </div>
      )}

      {existing && sel.note && !mode && (
        <div style={{ marginTop: S.lg, fontSize: T.base, lineHeight: 1.7, background: alpha(tintOf(sel.color), 0.14), borderRadius: R.md, padding: `${S.md}px ${S.lg}px` }}>{sel.note}</div>
      )}
      {err && <div role="alert" style={{ marginTop: S.lg, fontSize: T.sm, color: C.red, lineHeight: 1.6 }}>{err}</div>}
    </div>,
    document.body,
  );
}

const icon = { background: "transparent", border: "none", cursor: "pointer", padding: S.xs, lineHeight: 0 };
const action = { display: "flex", alignItems: "center", gap: S.sm, fontFamily: FONT, fontWeight: 600, fontSize: T.base, borderRadius: R.md, padding: `${S.lg}px ${S.xl}px`, border: "none", cursor: "pointer", background: P.bg, color: P.ink };
