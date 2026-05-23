// import { createTRPCContext } from "@trpc/tanstack-react-query";
// import type { AppRouter } from "@myapp/api";
// export const { TRPCProvider, useTRPC, useTRPCClient } =
//   createTRPCContext<AppRouter>();

import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@myapp/api";

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/trpc`,
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
