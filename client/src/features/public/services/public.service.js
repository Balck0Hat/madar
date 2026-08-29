import { get } from "../../../shared/utils/api";

export const getProfile = (handle) => get(`/public/users/${encodeURIComponent(handle)}`).then((d) => d.profile);
