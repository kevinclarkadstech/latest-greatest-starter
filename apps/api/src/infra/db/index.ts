import {
  drizzle as drizzleNeon,
  NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import {
  drizzle as drizzleNode,
  NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { schema } from "./schema";

export type DbConfig = {
  connectionString: string;
  driver: "neon" | "node"; // Explicitly choose the plumbing
};

export function createDb({ connectionString, driver }: DbConfig) {
  if (driver === "neon") {
    const client = neon(connectionString);
    return drizzleNeon(client, { schema });
  }

  const pool = new Pool({ connectionString });
  return drizzleNode(pool, { schema });
}

// This remains the "Source of Truth" for your app's DB type
export type AppDb = ReturnType<typeof createDb>;
