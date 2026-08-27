import { z } from "zod";

export const fieldErrorSchema = z
  .object({
    message: z.string().min(1),
    path: z.string().min(1),
  })
  .strict();

export const apiErrorSchema = z
  .object({
    code: z.string().min(1),
    fieldErrors: z.array(fieldErrorSchema).optional(),
    message: z.string().min(1),
    requestId: z.string().min(1),
  })
  .strict();

export const apiErrorEnvelopeSchema = z
  .object({ error: apiErrorSchema })
  .strict();

export const createSuccessEnvelopeSchema = <Schema extends z.ZodTypeAny>(
  data: Schema,
) => z.object({ data }).strict();

export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;
export type FieldError = z.infer<typeof fieldErrorSchema>;
