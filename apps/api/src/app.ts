import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";
import websocket from "@fastify/websocket";
import {
  fastifyInngestHandler,
  fastifyWebsocketHandler,
  fastifyTrpcHandler,
} from "./infra";
import { helloWorld } from "./infra/inngest/functions";
import { appRouter } from "./infra/trpc/routers";
import { createContext } from "./infra/trpc/init";

const server = Fastify({ logger: true });

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
server.all("/api/auth/*", async (req, reply) => {
  return toNodeHandler(auth)(req.raw, reply.raw);
});

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
