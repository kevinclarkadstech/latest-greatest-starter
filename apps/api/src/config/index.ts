import z from "zod";
import dotenv from "dotenv";

const AppConfigSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  DATABASE_URL: z.string(),
});

type AppConfig = z.infer<typeof AppConfigSchema>;

function createConfig(
  input: Record<string, string | undefined> = process.env,
): AppConfig {
  dotenv.config(); // Load environment variables from .env file
  const result = AppConfigSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }
  return result.data;
}

export { createConfig, type AppConfig };
