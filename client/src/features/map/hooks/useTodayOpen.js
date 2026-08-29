import { useCallback, useState } from "react";

const KEY = "madar.today.open";

// نتذكّر إن كان شريط «اليوم» مفتوحاً لأن هذا قرار شخصي: من يتابع أرقامه يريدها
// كل صباح، ومن لا يريدها يجب ألا يُجبَر على طيّها في كل زيارة.
// الافتراضي مطويّ: الشاشة الأولى تحمل فعلاً واحداً لا ستة.
// التخزين قد يكون محجوباً (تصفّح خاص أو منع بيانات الموقع) فكل وصول داخل try/catch.
const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

const write = (open) => {
  try {
    localStorage.setItem(KEY, open ? "1" : "0");
  } catch {
    // التخزين محجوب: نكتفي بحالة الجلسة بدل أن نُسقط الواجهة
  }
};

export function useTodayOpen() {
  const [open, setOpen] = useState(read);
  const toggle = useCallback(() => {
    setOpen((prev) => {
      write(!prev);
      return !prev;
    });
  }, []);
  return [open, toggle];
}
