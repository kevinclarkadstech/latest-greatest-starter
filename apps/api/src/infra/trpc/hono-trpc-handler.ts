import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Hono } from "hono";
import type { appRouter } from "./routers/app-router";
import type { createContext } from "./init";

type TrpcOptions = {
  router: typeof appRouter;
  createContext: typeof createContext;
};

export function registerTrpcRoutes({
  app,
  prefix = "/trpc",
  trpcOptions,
}: {
  app: Hono;
  prefix?: string;
  trpcOptions: TrpcOptions;
}) {
  app.all(`${prefix}/*`, (c) =>
    fetchRequestHandler({
      endpoint: prefix,
      req: c.req.raw,
      router: trpcOptions.router,
      createContext: trpcOptions.createContext,
    }),
  );
}
