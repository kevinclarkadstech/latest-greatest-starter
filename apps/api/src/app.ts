import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { toNodeHandler } from "better-auth/node";
import websocket from "@fastify/websocket";
import {
  fastifyInngestHandler,
  fastifyWebsocketHandler,
  fastifyTrpcHandler,
  fastifyAuthHandler,
} from "./infra";
import { helloWorld } from "./infra/inngest/functions";
import { appRouter } from "./infra/trpc/routers";
import { createContext } from "./infra/trpc/init";
import { logger } from "./infra/observability";

const server = Fastify({});
server.addHook("onRequest", async (request, reply) => {
  logger.info("Incoming request??", {
    method: request.method,
    url: request.url,
    // Test redaction by throwing a dummy sensitive field in here
    ssn: "999-00-1111",
    ip: request.ip,
  });
});

server.register(websocket);
server.register(fastifyWebsocketHandler);

server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

server.register(cors, {
  origin: "*", // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
});

fastifyAuthHandler({ server });

fastifyTrpcHandler({
  server,
  trpcOptions: { router: appRouter, createContext },
});

fastifyInngestHandler({
  server,
  functions: [helloWorld],
});

server.get("/health", (req, reply) => {
  reply.send({ status: "ok" });
});

server.listen({ port: 3000 });
