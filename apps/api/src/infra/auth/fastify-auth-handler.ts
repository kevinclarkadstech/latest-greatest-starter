import { FastifyInstance } from "fastify";
import { createBetterAuthClient } from "./better-auth";
import { fromNodeHeaders } from "better-auth/node";

export function fastifyAuthHandler({
  server,
  path = "/api/auth/*",
  authClient,
}: {
  server: FastifyInstance;
  path?: string;
  authClient: ReturnType<typeof createBetterAuthClient>;
}) {
  server.route({
    method: ["GET", "POST"],
    url: path,
    async handler(request, reply) {
      const url = new URL(
        request.url,
        `${request.protocol}://${request.headers.host}`,
      );
      const headers = fromNodeHeaders(request.headers);

      const hasBody =
        request.method !== "GET" &&
        request.method !== "HEAD" &&
        request.body != null;

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(hasBody ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await authClient.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      const body = response.body ? await response.text() : null;
      reply.send(body);
    },
  });
}
