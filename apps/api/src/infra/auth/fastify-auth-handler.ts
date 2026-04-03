import { FastifyInstance } from "fastify";
import { createBetterAuthClient } from "./better-auth";
import { toNodeHandler } from "better-auth/node";

export function fastifyAuthHandler({
  server,
  path = "/api/auth/*",
  authClient,
}: {
  server: FastifyInstance;
  path?: string;
  authClient: ReturnType<typeof createBetterAuthClient>;
}) {
  return server.all(path, async (req, reply) => {
    return toNodeHandler(authClient)(req.raw, reply.raw);
  });
}
