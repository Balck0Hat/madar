import { get, put, post, del } from "../../../shared/utils/api";
import { postText } from "./postText";

export const getOverview = () => get("/admin/overview");
export const listUsers = () => get("/admin/users").then((d) => d.users);
export const setRole = (email, role) => post("/admin/users/role", { email, role }).then((d) => d.user);
export const listUnits = () => get("/admin/units").then((d) => d.units);
export const getUnit = (unitId) => get(`/admin/units/${unitId}`).then((d) => d.unit);
export const saveUnit = (unitId, body) => put(`/admin/units/${unitId}`, body).then((d) => d.unit);
export const deleteUnit = (unitId) => del(`/admin/units/${unitId}`);

// النسخ السابقة
export const listVersions = (unitId) => get(`/admin/units/${unitId}/versions`).then((d) => d.versions);
export const getVersion = (unitId, version) => get(`/admin/units/${unitId}/versions/${version}`);
export const restoreVersion = (unitId, version) => post(`/admin/units/${unitId}/versions/${version}/restore`).then((d) => d.unit);

// استيراد وتصدير
export const exportUnit = (unitId) => get(`/admin/units/${unitId}/export`).then((d) => d.unit);
export const exportAll = () => get("/admin/export").then((d) => d.units);
export const importUnits = (units, { force = false, dryRun = false } = {}) => postText("/admin/units/import", { units, force, dryRun });
