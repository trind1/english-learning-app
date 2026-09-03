import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const environmentSchema = z
  .object({
    AI_API_KEY: z.string().min(1).optional(),
    AI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
    AI_ENABLED: booleanString.default("false"),
    AI_FALLBACK_MODEL: z.string().min(1).optional(),
    AI_MODEL: z.string().min(1).optional(),
    AI_PROVIDER: z.enum(["local", "openai", "gemini"]).optional(),
    AI_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .max(60_000)
      .default(10_000),
    API_PORT: z.coerce.number().int().min(1).max(65_535).default(3_000),
    DATABASE_URL: z.string().trim().min(1),
    TEST_TOKEN_SECRET: z.string().min(32),
    WEB_ORIGIN: z.string().url(),
  })
  .superRefine((environment, context) => {
    if (!environment.AI_ENABLED) return;

    if (!environment.AI_PROVIDER) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI_PROVIDER is required when AI_ENABLED is true.",
        path: ["AI_PROVIDER"],
      });
    }

    if (
      (environment.AI_PROVIDER === "openai" ||
        environment.AI_PROVIDER === "gemini") &&
      !environment.AI_API_KEY
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI_API_KEY is required when AI_ENABLED is true.",
        path: ["AI_API_KEY"],
      });
    }
    if (
      (environment.AI_PROVIDER === "openai" ||
        environment.AI_PROVIDER === "gemini") &&
      !environment.AI_MODEL
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI_MODEL is required for the external AI provider.",
        path: ["AI_MODEL"],
      });
    }
  });

export type ApiConfig = Readonly<{
  ai: Readonly<{
    apiKey?: string;
    baseUrl: string;
    enabled: boolean;
    fallbackModel?: string;
    model?: string;
    provider?: "local" | "openai" | "gemini";
    timeoutMs: number;
  }>;
  databaseUrl: string;
  port: number;
  testTokenSecret: string;
  webOrigin: string;
}>;

export const parseEnvironment = (source: NodeJS.ProcessEnv): ApiConfig => {
  const environment = environmentSchema.parse(source);

  return {
    ai: {
      ...(environment.AI_API_KEY ? { apiKey: environment.AI_API_KEY } : {}),
      baseUrl: environment.AI_BASE_URL,
      enabled: environment.AI_ENABLED,
      ...(environment.AI_FALLBACK_MODEL
        ? { fallbackModel: environment.AI_FALLBACK_MODEL }
        : {}),
      ...(environment.AI_MODEL ? { model: environment.AI_MODEL } : {}),
      ...(environment.AI_PROVIDER ? { provider: environment.AI_PROVIDER } : {}),
      timeoutMs: environment.AI_TIMEOUT_MS,
    },
    databaseUrl: environment.DATABASE_URL,
    port: environment.API_PORT,
    testTokenSecret: environment.TEST_TOKEN_SECRET,
    webOrigin: environment.WEB_ORIGIN,
  };
};
