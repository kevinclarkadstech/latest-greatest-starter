import type { Hono } from "hono";
import { serve } from "inngest/hono";
import { inngest } from "./client";
import { InngestFunction } from "inngest";

export function registerInngestRoutes({
  app,
  functions,
  options,
}: {
  app: Hono;
  functions: readonly InngestFunction.Like[];
  options?: {
    path?: string;
    serveOptions?: Parameters<typeof serve>[0];
  };
}) {
  const path = options?.path ?? "/api/inngest";
  const handler = serve({
    client: inngest,
    functions,
    ...options?.serveOptions,
  });
  app.on(["GET", "POST", "PUT"], path, (c) => handler(c));
}
