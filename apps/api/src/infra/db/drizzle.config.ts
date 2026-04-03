import { defineConfig } from "drizzle-kit";

import dotenv from "dotenv";
dotenv.config();

console.log("Using database URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "./src/infra/db/schema/index.ts", // Points to your barrel file
  out: "./migrations", // Where your .sql files will live
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
