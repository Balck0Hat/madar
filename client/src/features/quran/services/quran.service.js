import { get, put, post } from "../../../shared/utils/api";

export const listSuras = () => get("/quran/suras").then((d) => d.suras);
export const getSura = (n) => get(`/quran/sura/${n}`).then((d) => d.sura);
export const getPage = (p) => get(`/quran/page/${p}`);
export const getSimilar = (s, a) => get(`/quran/similar/${s}/${a}`).then((d) => d.similar);

export const getMemo = () => get("/quran/memo");
export const setGoal = (goal) => put("/quran/memo/goal", goal);
export const reviewAyah = (s, a, correct) => post("/quran/memo/review", { s, a, correct }).then((d) => d.item);
export const logSession = (withWhom, ayahs) => post("/quran/memo/session", { with: withWhom, ayahs }).then((d) => d.sessions);

// صوت القارئ آيةً آية من أرشيف everyayah المفتوح (مشاري العفاسي)
const pad = (n) => String(n).padStart(3, "0");
export const audioUrl = (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`;

export const keyOf = (s, a) => `${s}:${a}`;
export const parseKey = (k) => k.split(":").map(Number);
