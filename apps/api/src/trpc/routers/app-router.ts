import { procedure, router } from "../init";
import { storageRouter } from "./storage-router";

/**
 * This is the primary router for your server.
 * All sub-routers are merged here.
 */
export const appRouter = router({
  greeting: procedure.query(({ ctx }) => {
    console.log("context", ctx);
    return `Hello, ${ctx.user?.name ?? "world"}!`;
  }),
  storage: storageRouter,
});
