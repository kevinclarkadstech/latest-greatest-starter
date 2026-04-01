import { FastifyInstance } from "fastify";
import { serve } from "inngest/fastify";
import { inngest } from "./client";
import { InngestFunction } from "inngest";

export function fastifyInngestHandler({
  server,
  functions,
  options,
}: {
  server: FastifyInstance;
  functions: readonly InngestFunction.Like[];
  options?: {
    path?: string;
    methods?: ("GET" | "POST" | "PUT" | "DELETE")[];
    serveOptions?: Parameters<typeof serve>[0];
  };
}) {
  return server.route({
    method: options?.methods ?? ["GET", "POST", "PUT"],
    url: options?.path ?? "/api/inngest",
    handler: serve({
      client: inngest,
      functions,
      ...options?.serveOptions,
    }),
  });
}
