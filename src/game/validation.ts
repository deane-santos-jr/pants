import { z } from "zod";
import { CATEGORIES, type Category, type RejectionKey } from "./types";

export const MAX_ENTRIES = 32;

export const validationRequestSchema = z.object({
  letter: z.string().regex(/^[A-Z]$/),
  entries: z
    .array(
      z.object({
        key: z.string().min(3).max(60),
        category: z.enum(CATEGORIES),
        answer: z.string().trim().min(1).max(80),
      }),
    )
    .min(1)
    .max(MAX_ENTRIES),
});

export type ValidationRequest = z.infer<typeof validationRequestSchema>;

export const verdictListSchema = z.object({
  verdicts: z.array(
    z.object({
      key: z.string(),
      meaning: z.string().max(160),
      valid: z.boolean(),
      reason: z.string().max(120),
    }),
  ),
});

export type ValidationEntry = ValidationRequest["entries"][number] & { key: RejectionKey; category: Category };
