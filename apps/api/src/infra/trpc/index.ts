import { appRouter } from "./routers/app-router";

/**
 * Export the type definition of the API.
 * This is ONLY the type—no server code is sent to the client.
 * Your frontend (Web or React Native) will import this type.
 */
export type AppRouter = typeof appRouter;
export { registerTrpcRoutes } from "./hono-trpc-handler";
export { createContext } from "./init";
export { appRouter } from "./routers/app-router";
