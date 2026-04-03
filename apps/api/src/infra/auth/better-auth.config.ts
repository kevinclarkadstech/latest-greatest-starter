import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import dotenv from "dotenv";
dotenv.config();

const fakeDb = {} as any; // Placeholder, will be overridden in the actual client

// We define the config with a dummy database instance because the CLI needs to read this file
// to know which plugins we're using and generate the appropriate schema.
// The actual database instance will be provided when we create the auth client.

export const authConfig = {
  // We leave the database as a placeholder because
  // the CLI only needs to see the PLUGINS to generate the schema.
  database: drizzleAdapter(fakeDb, { provider: "pg" }), // Placeholder, will be overridden in the actual client
  emailAndPassword: {
    enabled: true,
  },
  // Add any other plugins here (e.g., secondaryAuth, organizations)
  // so the CLI knows which tables to build.
} satisfies BetterAuthOptions;

const dummyAuthClient = betterAuth(authConfig);
// We export the config separately so the CLI can use it without needing
// the actual database instance, which isn't available at this point.

export default dummyAuthClient;
