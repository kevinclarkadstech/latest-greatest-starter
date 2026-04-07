import { FastifyInstance } from "fastify";
import { createBetterAuthClient } from "./better-auth";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { createLogger } from "@myapp/observability/node";

export function fastifyAuthHandler({
  server,
  path = "/api/auth/*",
  authClient,
  logger,
}: {
  server: FastifyInstance;
  path?: string;
  authClient: ReturnType<typeof createBetterAuthClient>;
  logger: ReturnType<typeof createLogger>["logger"];
}) {
  logger.info("Registering auth handler at path:", { path });
  return server.all(path, async (request, reply) => {
    // 2. Handle OPTIONS immediately if not handled by a global CORS plugin
    if (request.method === "OPTIONS") {
      return reply.status(204).send();
    }

    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);

      const authRequest = new Request(url.toString(), {
        method: request.method,
        headers,
        // CRITICAL: Only attach body for methods that support it
        body: ["POST", "PUT", "PATCH"].includes(request.method)
          ? JSON.stringify(request.body)
          : null,
      });

      const response = await authClient.handler(authRequest);

      // 3. Extract the body correctly
      const responseData = await response.text();

      // 4. Manual Header Forwarding
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        // Skip content-length to let Fastify recalculate it for the string
        if (key.toLowerCase() !== "content-length") {
          reply.header(key, value);
        }
      });

      return reply.send(responseData);
    } catch (error) {
      logger.error("Auth Proxy Error:");
      return reply.status(500).send({ error: "Internal Auth Error" });
    }
  });
}
