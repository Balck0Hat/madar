import { z } from "zod";
import { isValidUnitId } from "../../shared/utils/units.js";
import { NOTE_COLORS } from "./note.model.js";

// معرّف Mongo يُتحقَّق منه هنا لا في الخدمة، كي يعود 400 واضحاً بدل CastError
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "معرّف غير صالح");
// التظليل يعمل في الدروس وفي قصص الشخصيات (figure:<معرّف>)
const FIGURE_ID = /^figure:[a-z0-9-]{2,40}$/;
const BOOK_ID = /^book:[a-z0-9-]{2,40}:\d{1,2}$/; // فصل كتاب: book:<الكتاب>:<رقم الفصل>
const unitId = z.string().refine((id) => isValidUnitId(id) || FIGURE_ID.test(id) || BOOK_ID.test(id), "معرّف وحدة غير صالح");

export const createSchema = {
  body: z
    .object({
      unitId,
      page: z.coerce.number().int().min(0).max(200).default(0),
      text: z.string().trim().min(1, "النص المظلَّل مطلوب").max(600, "النص المظلَّل طويل جداً"),
      note: z.string().trim().max(500, "الملاحظة طويلة جداً").optional().default(""),
      color: z.enum(NOTE_COLORS).default("gold"),
    })
    .strict(),
};

export const listSchema = { query: z.object({ unitId: unitId.optional() }) };

export const updateSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ note: z.string().trim().max(500, "الملاحظة طويلة جداً") }).strict(),
};

export const idSchema = { params: z.object({ id: objectId }) };
