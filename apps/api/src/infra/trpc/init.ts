import { initTRPC, TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

const t = initTRPC.context<Context>().create();

// import { fromNodeHeaders } from 'better-auth/node';
// import { auth } from '../lib/auth';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  // Better Auth session check
  //   const session = await auth.api.getSession({
  //     headers: fromNodeHeaders(req.headers),
  //   });
  const session: { user?: { name: string }; session?: any } = {
    user: { name: "Kevin" },
  };

  return {
    req,
    res,
    user: session?.user ?? null,
    session: session?.session ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export const router = t.router;
export const procedure = t.procedure.use(({ ctx, next }) => {
  return next({
    ctx,
  });
});
