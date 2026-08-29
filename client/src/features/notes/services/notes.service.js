import { get, post, patch, del } from "../../../shared/utils/api";

// تظليلات القارئ: GET /notes[?unitId=] · POST /notes · PATCH /notes/:id · DELETE /notes/:id
export const list = (unitId) => get(unitId ? `/notes?unitId=${encodeURIComponent(unitId)}` : "/notes").then((d) => d.notes);
export const create = (payload) => post("/notes", payload).then((d) => d.note);
export const update = (id, note) => patch(`/notes/${id}`, { note }).then((d) => d.note);
export const remove = (id) => del(`/notes/${id}`);
