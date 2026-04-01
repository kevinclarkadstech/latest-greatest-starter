import z from "zod";
import { procedure, router } from "../init";
import { storageRouter } from "./storage-router";

/**
 * This is the primary router for your server.
 * All sub-routers are merged here.
 */
export const appRouter = router({
  greeting: procedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ ctx, input }) => {
      console.log("context", ctx);
      return `Hello, ${input?.name ?? ctx.user?.name ?? "world"}!`;
    }),
  storage: storageRouter,
});
