import { get, post } from "../../../shared/utils/api";

// اختبار تحديد المستوى
export const getPlacement = () => get("/english/placement");
export const startPlacement = () => post("/english/placement", {}).then((d) => d.session);
export const answerPlacement = (id, itemId, choice) => post(`/english/placement/${id}/answer`, { itemId, choice });
export const timeoutPlacement = (id) => post(`/english/placement/${id}/timeout`, {}).then((d) => d.session);
export const submitWriting = (id, text) => post(`/english/placement/${id}/writing`, { text }).then((d) => d.session);
export const skipWriting = (id) => post(`/english/placement/${id}/writing`, { skip: true }).then((d) => d.session);

// المسارات: آيلتس وتوفل والإنجليزية العامة
export const getTracks = () => get("/english/tracks");
export const getModule = (id) => get(`/english/tracks/modules/${id}`);
export const startModule = (id) => post(`/english/tracks/modules/${id}/start`, {}).then((d) => d.attempt);
export const submitSection = (attemptId, sectionId, answers) => post(`/english/practice/${attemptId}/section`, { sectionId, answers });
export const getLesson = (tag) => get(`/english/tracks/lessons/${tag}`).then((d) => d.lesson);
export const startLesson = (tag) => post(`/english/tracks/lessons/${tag}/start`, {});
export const startWeak = (tag) => post(`/english/tracks/weak/${tag}/start`, {});
export const answerPractice = (attemptId, itemId, choice) => post(`/english/practice/${attemptId}/answer`, { itemId, choice });
export const getAttempt = (id) => get(`/english/practice/${id}`).then((d) => d.attempt);
export const getWritingTask = (id) => get(`/english/tracks/writing/${id}`);
export const submitTaskWriting = (id, text) => post(`/english/tracks/writing/${id}`, { text }).then((d) => d.attempt);

// لوحة المعايرة (مشرف)
export const getCalibration = () => get("/english/admin/calibration");
export const runCalibration = () => post("/english/admin/calibrate", {});
