import { FastifyInstance } from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

type FullTrpcOptions = Parameters<typeof fastifyTRPCPlugin>[1]["trpcOptions"];
export function fastifyTrpcHandler({
  server,
  prefix = "/trpc",
  trpcOptions,
}: {
  server: FastifyInstance;
  prefix?: string;
  trpcOptions: Partial<FullTrpcOptions> &
    Pick<FullTrpcOptions, "router" | "createContext">;
}) {
  return server.register(fastifyTRPCPlugin, {
    prefix,
    trpcOptions,
  });
}
