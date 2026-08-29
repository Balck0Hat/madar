import { get, put, post, del } from "../../../shared/utils/api";

export const getOverview = () => get("/admin/overview");
export const listUsers = () => get("/admin/users").then((d) => d.users);
export const setRole = (email, role) => post("/admin/users/role", { email, role }).then((d) => d.user);
export const listUnits = () => get("/admin/units").then((d) => d.units);
export const getUnit = (unitId) => get(`/admin/units/${unitId}`).then((d) => d.unit);
export const saveUnit = (unitId, body) => put(`/admin/units/${unitId}`, body).then((d) => d.unit);
export const deleteUnit = (unitId) => del(`/admin/units/${unitId}`);
