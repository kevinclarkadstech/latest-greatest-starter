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
  // Register in a scoped plugin so the content-type parser override
  // only applies to Better Auth routes and does not affect tRPC or other handlers.
  server.register(async (instance) => {
    // Fastify's default body parser consumes the IncomingMessage stream before the
    // route handler runs. toNodeHandler reads from req.raw (Node IncomingMessage),
    // so it would hang waiting for body data that is already consumed.
    // Using parseAs: 'string' lets us capture the raw body string and forward it
    // onto req.raw.body where toNodeHandler can read it directly.
    instance.addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (_req, body, done) => done(null, body),
    );

    instance.all(path, async (req, reply) => {
      // Forward the body Fastify already read onto the raw IncomingMessage so that
      // toNodeHandler does not try to re-read the already-consumed stream.
      if (req.body !== undefined) {
        (req.raw as any).body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
      return toNodeHandler(authClient)(req.raw, reply.raw);
    });
  });
}
