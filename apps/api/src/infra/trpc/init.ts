import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

const t = initTRPC.context<Context>().create();

// import { auth } from '../lib/auth';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  // Better Auth session check
  //   const session = await auth.api.getSession({ headers: req.headers });
  const session: { user?: { name: string }; session?: any } = {
    user: { name: "Kevin" },
  };

  return {
    req,
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
