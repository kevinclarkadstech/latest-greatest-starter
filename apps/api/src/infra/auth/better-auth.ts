import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { AppDb } from "../db"; // Use the type we created earlier
import { authConfig } from "./better-auth.config";

export function createBetterAuthClient({ db }: { db: AppDb }) {
  return betterAuth({
    ...authConfig,
    // We override the database function here with the actual instance
    database: drizzleAdapter(db, { provider: "pg" }),
  });
}
