import { useState, useEffect, useCallback, useRef } from "react";

// جلب بيانات مع حالات التحميل والخطأ وإعادة المحاولة؛ يتجاهل نتائج الطلبات القديمة
export function useAsync(fn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const seq = useRef(0);
  const run = useCallback(async () => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (id === seq.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === seq.current) setState({ data: null, error, loading: false });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (enabled) run(); else setState({ data: null, error: null, loading: false }); }, [run, enabled]);
  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) };
}
