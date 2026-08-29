import { get, post, patch } from "../../../shared/utils/api";

export const register = ({ name, email, password }) => post("/auth/register", { name, email, password }).then((d) => d.user);
export const login = ({ email, password }) => post("/auth/login", { email, password }).then((d) => d.user);
export const logout = () => post("/auth/logout");
export const me = () => get("/users/me").then((d) => d.user);
export const updateMe = (fields) => patch("/users/me", fields).then((d) => d.user);
