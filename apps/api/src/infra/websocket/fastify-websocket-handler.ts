import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { z } from "zod";
import { connectionManager } from "./connection-manager";

const InboundMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ping") }),
  z.object({ type: z.literal("join"), room: z.string() }),
  z.object({ type: z.literal("leave"), room: z.string() }),
  z.object({
    type: z.literal("message"),
    room: z.string(),
    payload: z.unknown(),
  }),
]);

type InboundMessage = z.infer<typeof InboundMessage>;

export async function fastifyWebsocketHandler(fastify: FastifyInstance) {
  fastify.get("/ws", { websocket: true }, (socket: WebSocket, req) => {
    const id = randomUUID();

    connectionManager.add(id, socket);

    connectionManager.send(id, { type: "connected", payload: { id } });

    socket.on("message", (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        connectionManager.send(id, { type: "error", payload: "Invalid JSON" });
        return;
      }

      const result = InboundMessage.safeParse(parsed);
      if (!result.success) {
        connectionManager.send(id, {
          type: "error",
          payload: result.error.flatten(),
        });
        return;
      }
      const msg = result.data;

      switch (msg.type) {
        case "ping":
          connectionManager.send(id, { type: "pong" });
          break;

        case "join":
          connectionManager.join(id, msg.room);
          connectionManager.send(id, {
            type: "joined",
            payload: {
              room: msg.room,
              size: connectionManager.roomSize(msg.room),
            },
          });
          break;

        case "leave":
          connectionManager.leave(id, msg.room);
          connectionManager.send(id, {
            type: "left",
            payload: { room: msg.room },
          });
          break;

        case "message":
          connectionManager.broadcast(
            { type: "message", payload: msg.payload },
            { room: msg.room, exclude: id },
          );
          break;
      }
    });
  });
}
