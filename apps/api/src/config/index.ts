import z from "zod";
import dotenv from "dotenv";

type AppConfig = {
  API_KEY: string;
};

const AppConfigSchema = z.object({
  API_KEY: z.string(),
});

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
