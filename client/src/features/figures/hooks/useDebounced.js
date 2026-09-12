import { useEffect, useState } from "react";

// قيمة مؤجَّلة: البحث لا يضرب الخادم مع كل حرف
export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
