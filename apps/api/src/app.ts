import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { rateLimiter } from "hono-rate-limiter";
import {
  registerInngestRoutes,
  attachWebSocketServer,
  registerTrpcRoutes,
  registerAuthRoutes,
  helloWorld,
  appRouter,
  createContext,
  logger,
  createBetterAuthClient,
  createDb,
  AppDb,
} from "@/infra";
import { createConfig } from "./config";

const app = new Hono();
const config = createConfig();

/**Singletons */
const db: AppDb = createDb({
  connectionString: config.DATABASE_URL,
  driver: "node",
});

const betterAuthClient = createBetterAuthClient({ db, logger });
/** End singletons */

app.use(
  "*",
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

app.use(
  "*",
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: (c) =>
      c.req.header("x-forwarded-for") ??
      c.req.header("x-real-ip") ??
      "anonymous",
  }),
);

registerAuthRoutes({ app, authClient: betterAuthClient, logger });

registerTrpcRoutes({ app, trpcOptions: { router: appRouter, createContext } });

registerInngestRoutes({ app, functions: [helloWorld] });

app.get("/health", (c) => c.json({ status: "ok" }));

app.notFound((c) => {
  console.log("This route does not exist:", c.req.method, c.req.url);
  return c.json({ error: "Route not found" }, 404);
});

const server = serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});

attachWebSocketServer(server);

