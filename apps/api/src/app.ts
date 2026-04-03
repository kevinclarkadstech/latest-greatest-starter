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
} from "@/infra";

const server = Fastify({});

/**Singletons */
const db = createDb({
  connectionString: process.env.DB_CONNECTION_STRING!,
  driver: "node",
});

const betterAuthClient = createBetterAuthClient({ db });
/** End singletons */

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

fastifyAuthHandler({
  server,
  authClient: betterAuthClient,
  path: "/api/auth/*",
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
