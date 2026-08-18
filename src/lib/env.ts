import { z } from "zod";

const envSchema = z.object({
  VERITAS_DATABASE_FILE: z.string().min(1).default("./data/veritas.db"),
  VERITAS_ENCRYPTION_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.url().default("https://api.openai.com/v1"),
  OPENAI_MODEL: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),
  NEWSAPI_KEY: z.string().optional(),
  GUARDIAN_API_KEY: z.string().optional(),
  GOOGLE_FACT_CHECK_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
