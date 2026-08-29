import { Trash2 } from "lucide-react";
import { C, inputStyle } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import { Q_TYPES, toLines, fromLines, fromCsv } from "../utils/editor.utils";

const small = { ...inputStyle, padding: "9px 12px", fontSize: 14 };
const Label = ({ children }) => <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{children}</div>;

// محرّر سؤال واحد من بنك الوحدة
export default function QuestionEditor({ q, index, onChange, onRemove }) {
  const set = (patch) => onChange({ ...q, ...patch });
  const setType = (t) => set({ t, opts: t === "mcq" ? q.opts?.length ? q.opts : ["", "", "", ""] : undefined, items: t === "order" ? q.items || ["", "", ""] : undefined, a: t === "tf" ? true : t === "mcq" ? 0 : t === "open" ? undefined : [] });
  const aText = Array.isArray(q.a) ? q.a.join("، ") : q.a ?? "";
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 800, color: C.gold }}>س{index + 1}</span>
        <select aria-label="نوع السؤال" value={q.t} onChange={(e) => setType(e.target.value)} style={{ ...small, width: "auto" }}>
          {Q_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input aria-label="معرّف السؤال" value={q.qid} onChange={(e) => set({ qid: e.target.value })} style={{ ...small, width: 80 }} />
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="حذف السؤال" onClick={onRemove} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer" }}><Trash2 size={16} /></button>
      </div>
      <textarea aria-label="نص السؤال" value={q.q} onChange={(e) => set({ q: e.target.value })} placeholder="نص السؤال" rows={2} style={{ ...small, resize: "vertical" }} />
      {q.t === "mcq" && (
        <div style={{ display: "grid", gap: 6 }}>
          <Label>الخيارات (اختر الصحيح)</Label>
          {(q.opts || []).map((o, k) => (
            <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name={`a-${q.qid}-${index}`} checked={Number(q.a) === k} onChange={() => set({ a: k })} aria-label={`الخيار ${k + 1} صحيح`} />
              <input value={o} onChange={(e) => set({ opts: q.opts.map((x, j) => (j === k ? e.target.value : x)) })} placeholder={`الخيار ${k + 1}`} style={small} />
            </div>
          ))}
        </div>
      )}
      {q.t === "tf" && (
        <div style={{ display: "flex", gap: 8 }}>
          {[["صح", true], ["خطأ", false]].map(([l, v]) => <Btn key={l} small full={false} primary={q.a === v} onClick={() => set({ a: v })}>{l}</Btn>)}
        </div>
      )}
      {q.t === "fill" && <div><Label>الإجابات المقبولة (مفصولة بفاصلة)</Label><input value={aText} onChange={(e) => set({ a: fromCsv(e.target.value) })} style={small} /></div>}
      {q.t === "order" && (
        <div style={{ display: "grid", gap: 6 }}>
          <Label>العناصر (سطر لكل عنصر)</Label>
          <textarea value={toLines(q.items)} onChange={(e) => set({ items: fromLines(e.target.value) })} rows={3} style={{ ...small, resize: "vertical" }} />
          <Label>الترتيب الصحيح بأرقام العناصر من 0 (مثال: 1، 2، 0)</Label>
          <input value={aText} onChange={(e) => set({ a: fromCsv(e.target.value).map(Number) })} style={small} />
        </div>
      )}
      {q.t === "open" && <div><Label>كلمات مفتاحية للتصحيح التقريبي (مفصولة بفاصلة)</Label><input value={(q.keywords || []).join("، ")} onChange={(e) => set({ keywords: fromCsv(e.target.value) })} style={small} /></div>}
      <div><Label>التفسير بعد الإجابة</Label><input value={q.why || ""} onChange={(e) => set({ why: e.target.value })} style={small} /></div>
    </div>
  );
}
