import { get } from "../../../shared/utils/api";

export const getStandings = () => get("/league");
