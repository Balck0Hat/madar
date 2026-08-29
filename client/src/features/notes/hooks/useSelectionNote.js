import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as notesService from "../services/notes.service";

const MAX_QUOTE = 600;
const MIN_QUOTE = 2;
// UnitScreen يعيد بناء صفحة الدرس عند كل تقليب (key={page})، فبدون ذاكرة صغيرة
// هنا سيُعاد جلب التظليلات مع كل ضغطة «التالي». المفتاح هو الوحدة.
const cache = new Map();

const boxOf = (rect) => ({ top: rect.top, bottom: rect.bottom, center: rect.left + rect.width / 2 });

// تظليل نص الدرس: يقرأ تحديد القارئ، ويدير شريط الأدوات العائم، ويحفظ على الخادم.
// كل نداء للشبكة محاط بحماية: إن تعذّر الاتصال يبقى الدرس مقروءاً بلا تظليلات.
export function useSelectionNote(unitId, page) {
  const ref = useRef(null);
  const timer = useRef(0);
  const [notes, setNotes] = useState(() => cache.get(unitId) || []);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const put = useCallback((next) => { cache.set(unitId, next); setNotes(next); }, [unitId]);

  useEffect(() => {
    let alive = true;
    notesService.list(unitId)
      .then((list) => { if (alive) { cache.set(unitId, list); setNotes(list); } })
      // الميزة كمالية: تفشل بصمت ولا تُظهر خطأ فوق الدرس. ونُفرغ الذاكرة كي لا
      // تبقى تظليلات جلسة سابقة معروضة بعد خروج صاحبها من الحساب.
      .catch(() => { cache.delete(unitId); if (alive) setNotes([]); });
    return () => { alive = false; };
  }, [unitId]);

  // نستمع لـ selectionchange لا لـ mouseup: هو الحدث الوحيد الذي يصف
  // تحديد اللمس أيضاً بعد أن يسحب القارئ مقبضي التحديد على الهاتف
  useEffect(() => {
    const read = () => {
      const s = window.getSelection?.();
      const host = ref.current;
      if (!host || !s || !s.rangeCount || s.isCollapsed) {
        setSel((cur) => (cur?.id ? cur : null)); // تظليل مفتوح للتحرير لا يُغلق بزوال التحديد
        return;
      }
      const range = s.getRangeAt(0);
      if (!host.contains(range.commonAncestorContainer)) return; // تحديد خارج متن الدرس
      const text = s.toString().trim();
      if (text.length < MIN_QUOTE) return;
      setErr("");
      setSel({ text: text.slice(0, MAX_QUOTE), at: boxOf(range.getBoundingClientRect()) });
    };
    const onChange = () => { clearTimeout(timer.current); timer.current = setTimeout(read, 220); };
    document.addEventListener("selectionchange", onChange);
    return () => { document.removeEventListener("selectionchange", onChange); clearTimeout(timer.current); };
  }, [page]);

  const close = useCallback(() => { setSel(null); setErr(""); window.getSelection?.()?.removeAllRanges?.(); }, []);

  // نقرة على تظليل قائم تفتح شريطه؛ ونقرة بعد تحديد نصّ لا يجوز أن تقلب الصفحة
  const onClick = useCallback((e) => {
    const hit = e.target.closest?.("[data-note-id]");
    if (hit) {
      e.stopPropagation();
      const found = (cache.get(unitId) || []).find((n) => n.id === hit.dataset.noteId);
      if (found) setSel({ ...found, at: boxOf(hit.getBoundingClientRect()) });
      return;
    }
    if (window.getSelection?.()?.toString().trim()) { e.stopPropagation(); return; }
    setSel((cur) => (cur?.id ? null : cur)); // نقرة في الفراغ تُغلق شريط تظليل مفتوح
  }, [unitId]);

  // Escape يُغلق الشريط لا الدرس؛ الالتقاط في مرحلة capture ليسبق مستمع UnitScreen
  useEffect(() => {
    if (!sel) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape" || e.target?.tagName === "TEXTAREA") return;
      e.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [sel, close]);

  const guard = async (fn) => {
    setBusy(true); setErr("");
    try { await fn(); close(); } catch (error) { setErr(error.message || "تعذّر الحفظ"); } finally { setBusy(false); }
  };

  const save = (color, note = "") => guard(async () => {
    const created = await notesService.create({ unitId, page, text: sel.text, note, color });
    put([created, ...(cache.get(unitId) || [])]);
  });

  const edit = (note) => guard(async () => {
    const updated = await notesService.update(sel.id, note);
    put((cache.get(unitId) || []).map((n) => (n.id === updated.id ? updated : n)));
  });

  const remove = () => guard(async () => {
    await notesService.remove(sel.id);
    put((cache.get(unitId) || []).filter((n) => n.id !== sel.id));
  });

  const pageNotes = useMemo(() => notes.filter((n) => n.page === page), [notes, page]);
  return { ref, onClick, notes, pageNotes, sel, close, save, edit, remove, busy, err };
}
