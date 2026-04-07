import { createLogger } from "@myapp/observability/node";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { AppDb } from "../db"; // Use the type we created earlier
import { authConfig } from "./better-auth.config";
import { emailOTP } from "better-auth/plugins/email-otp";

export function createBetterAuthClient({
  db,
  logger,
}: {
  db: AppDb;
  logger: ReturnType<typeof createLogger>["logger"];
}) {
  return betterAuth({
    ...authConfig,
    // We override the database function here with the actual instance
    database: drizzleAdapter(db, { provider: "pg" }),
  });
}
