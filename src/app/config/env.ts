import { z } from "zod";

// The only place in the app that reads import.meta.env. Everything else imports `env`.
const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_ENABLE_MSW: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = Object.freeze(parsed.data);
