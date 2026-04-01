import { FastifyInstance } from "fastify";
import { betterAuthClient } from "./better-auth-client";
import { toNodeHandler } from "better-auth/node";

export function fastifyAuthHandler({
  server,
  path = "/api/auth/*",
}: {
  server: FastifyInstance;
  path?: string;
}) {
  return server.all(path, async (req, reply) => {
    return toNodeHandler(betterAuthClient)(req.raw, reply.raw);
  });
}
