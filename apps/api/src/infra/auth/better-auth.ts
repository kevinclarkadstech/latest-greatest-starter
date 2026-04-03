import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { NeonQueryFunction } from "@neondatabase/serverless";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createBetterAuthClient({
  db,
}: {
  db:
    | (NeonHttpDatabase<any> & {
        $client: NeonQueryFunction<false, false>;
      })
    | (NodePgDatabase<any> & {
        $client: Pool;
      });
}) {
  const betterAuthClient = betterAuth({
    // database: new Pool({
    //   connectionString: process.env.DATABASE_URL,
    // }),
    database: drizzleAdapter(db, {
      provider: "pg", // or "pg" or "mysql"
    }),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: process.env.BASE_URL!,
  });

  return betterAuthClient;
}
