import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter, createContext } from "./trpc";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";
import websocket from "@fastify/websocket";
import { wsRoutes } from "./ws";

const server = Fastify({ logger: true });

server.register(websocket);
server.register(wsRoutes);

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

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

server.get("/health", (req, reply) => {
  reply.send({ status: "ok" });
});

server.listen({ port: 3000 });
