import { z } from "zod";

// حرفان حد أدنى: أقل من ذلك يطابق كل شيء ويُتعب القاعدة بلا فائدة
export const searchSchema = {
  query: z.object({ q: z.string().trim().min(2, "اكتب حرفين على الأقل").max(60) }),
};
