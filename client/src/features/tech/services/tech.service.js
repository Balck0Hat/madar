import { get, post } from "../../../shared/utils/api";

export const getTechTree = () => get("/tech");
export const getTechTopic = (id) => get(`/tech/${id}`).then((d) => d.topic);
export const searchTech = (q) => get(`/tech/search?q=${encodeURIComponent(q)}`).then((d) => d.hits);
export const toggleTechMark = (id) => post(`/tech/${id}/mark`, {});
export const getTechInterview = (branch) => get(`/tech/interview/${branch}`);

// أدوات الشبكة الحيّة
export const getDns = (name) => get(`/tech/tools/dns?name=${encodeURIComponent(name)}`);
export const getMyIp = () => get("/tech/tools/ip");
export const pingServer = () => get("/tech/tools/ping");
export const getTrace = (name) => get(`/tech/tools/trace?name=${encodeURIComponent(name)}`);
