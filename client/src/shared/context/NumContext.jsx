import { createContext, useContext } from "react";
import { toAr } from "../utils/text";

// true = أرقام عربية-هندية (١٢٣)، false = لاتينية (123)
export const NumCtx = createContext(false);

export const useNum = () => {
  const arabic = useContext(NumCtx);
  return (v) => (arabic ? toAr(v) : String(v));
};
