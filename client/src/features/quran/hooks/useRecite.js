import { useCallback, useEffect, useRef, useState } from "react";

// قناة التسميع المباشر: تفتح WebSocket على /ws/recite (بكوكي الدخول)، تعلن
// الآية، تدفع قطع الصوت، وتستقبل حالة كل كلمة كلما أعاد الخادم تعرّفاً جديداً.
const wsUrl = () => `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/recite`;

export function useRecite() {
  const [state, setState] = useState({ status: [], cursor: 0, done: false, text: "", ok: 0, miss: 0 });
  const [phase, setPhase] = useState("idle"); // idle | connecting | ready | done | error
  const [error, setError] = useState("");
  const ws = useRef(null);

  const close = useCallback(() => { ws.current?.close(); ws.current = null; setPhase("idle"); }, []);

  const begin = useCallback((s, a) => new Promise((resolve, reject) => {
    close();
    setError(""); setPhase("connecting");
    setState({ status: [], cursor: 0, done: false, text: "", ok: 0, miss: 0 });
    let sock;
    try { sock = new WebSocket(wsUrl()); } catch (err) { setPhase("error"); setError("تعذّر فتح قناة التسميع"); reject(err); return; }
    sock.binaryType = "arraybuffer";
    sock.onopen = () => sock.send(JSON.stringify({ t: "start", s, a }));
    sock.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.t === "ready") { setPhase("ready"); resolve(); }
      else if (m.t === "state") setState({ status: m.status, cursor: m.cursor, done: m.done, text: m.text, ok: m.ok, miss: m.miss });
      else if (m.t === "done") setPhase("done");
      else if (m.t === "error") { setError(m.message); }
    };
    sock.onerror = () => { setPhase("error"); setError("انقطعت قناة التسميع"); reject(new Error("ws")); };
    sock.onclose = () => { if (ws.current === sock) ws.current = null; };
    ws.current = sock;
  }), [close]);

  const push = useCallback((buf) => { if (ws.current?.readyState === 1) ws.current.send(buf); }, []);
  const finish = useCallback(() => { if (ws.current?.readyState === 1) ws.current.send(JSON.stringify({ t: "stop" })); }, []);

  useEffect(() => close, [close]);
  return { ...state, phase, error, begin, push, finish, close };
}
