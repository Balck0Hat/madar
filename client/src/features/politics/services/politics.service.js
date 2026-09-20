import { get } from "../../../shared/utils/api";

export const getOverview = () => get("/politics/overview");
export const listCountries = () => get("/politics/countries").then((d) => d.countries);
export const getCountry = (countryId) => get(`/politics/countries/${encodeURIComponent(countryId)}`).then((d) => d.country);
export const listTitles = () => get("/politics/titles").then((d) => d.families);
