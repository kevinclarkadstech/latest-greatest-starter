import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter, createContext } from "./trpc";
import cors from "@fastify/cors";
// import { auth } from './lib/auth';
// import { toNodeHandler } from 'better-auth/node';

const server = Fastify({ logger: true });

server.register(cors, {
  origin: "*", // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
});
// 1. Better Auth Catch-all Route
// server.all('/api/auth/*', async (req, reply) => {
//   return toNodeHandler(auth)(req.raw, reply.raw);
// });

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

server.get("/health", (req, reply) => {
  reply.send({ status: "ok" });
});

server.listen({ port: 3000 });
