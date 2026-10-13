import { z } from "zod";

export const extractTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(20, "Please paste more of the event text (at least 20 characters)")
    .max(15000, "Text is too long (max 15000 characters)"),
});