import type { Hono } from "hono";
import type { createBetterAuthClient } from "./better-auth";
import type { createLogger } from "@myapp/observability/node";

export function registerAuthRoutes({
  app,
  authClient,
  path = "/api/auth/*",
  logger,
}: {
  app: Hono;
  authClient: ReturnType<typeof createBetterAuthClient>;
  path?: string;
  logger: ReturnType<typeof createLogger>["logger"];
}) {
  logger.info("Registering auth handler at path:", { path });
  app.all(path, (c) => authClient.handler(c.req.raw));
}
