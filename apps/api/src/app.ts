import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import {
  fastifyInngestHandler,
  fastifyWebsocketHandler,
  fastifyTrpcHandler,
  fastifyAuthHandler,
  helloWorld,
  appRouter,
  createContext,
  logger,
  createBetterAuthClient,
  createDb,
  AppDb,
} from "@/infra";
import { fromNodeHeaders } from "better-auth/node";
import { createConfig } from "./config";

const server = Fastify({
  logger: true,
});
const config = createConfig();

/**Singletons */
const db: AppDb = createDb({
  connectionString: config.DATABASE_URL,
  driver: "node",
});

const betterAuthClient = createBetterAuthClient({ db, logger });
/** End singletons */

server.register(websocket);
server.register(fastifyWebsocketHandler);

server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

server.register(cors, {
  origin: ["http://localhost:5174", "http://localhost:5173"], // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Specify allowed headers
  credentials: true, // Allow cookies to be sent
  preflightContinue: true, // Pass the CORS preflight response to the next handler
});

fastifyAuthHandler({
  server,
  authClient: betterAuthClient,
  path: "/api/auth/*",
  logger,
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

server.setNotFoundHandler((request, reply) => {
  console.log("This route does not exist:", request.method, request.url);
  reply.code(404).send({ error: "Route not found" });
});

server.listen({ port: 3000 });
