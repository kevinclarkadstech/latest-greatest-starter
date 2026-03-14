import type { WebSocket } from "ws";

export type ConnectionMetadata = Record<string, unknown>;

type Connection = {
  id: string;
  socket: WebSocket;
  rooms: Set<string>;
  metadata: ConnectionMetadata;
  connectedAt: Date;
};

type OutboundMessage = {
  type: string;
  payload?: unknown;
};

export class ConnectionManager {
  private connections = new Map<string, Connection>();
  private rooms = new Map<string, Set<string>>();

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  add(id: string, socket: WebSocket, metadata: ConnectionMetadata = {}): void {
    this.connections.set(id, {
      id,
      socket,
      rooms: new Set(),
      metadata,
      connectedAt: new Date(),
    });

    socket.on("close", () => this.remove(id));
  }

  remove(id: string): void {
    const conn = this.connections.get(id);
    if (!conn) return;

    for (const room of conn.rooms) {
      this.rooms.get(room)?.delete(id);
      if (this.rooms.get(room)?.size === 0) this.rooms.delete(room);
    }

    this.connections.delete(id);
  }

  // -------------------------------------------------------------------------
  // Rooms
  // -------------------------------------------------------------------------

  join(id: string, room: string): void {
    const conn = this.connections.get(id);
    if (!conn) return;

    conn.rooms.add(room);

    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room)!.add(id);
  }

  leave(id: string, room: string): void {
    const conn = this.connections.get(id);
    if (!conn) return;

    conn.rooms.delete(room);
    this.rooms.get(room)?.delete(id);
    if (this.rooms.get(room)?.size === 0) this.rooms.delete(room);
  }

  // -------------------------------------------------------------------------
  // Sending
  // -------------------------------------------------------------------------

  send(id: string, message: OutboundMessage): boolean {
    const conn = this.connections.get(id);
    if (!conn || conn.socket.readyState !== conn.socket.OPEN) return false;

    conn.socket.send(JSON.stringify(message));
    return true;
  }

  broadcast(
    message: OutboundMessage,
    options: { room?: string; exclude?: string | string[] } = {}
  ): void {
    const { room, exclude } = options;
    const excluded = new Set(
      Array.isArray(exclude) ? exclude : exclude ? [exclude] : []
    );

    const targets = room
      ? [...(this.rooms.get(room) ?? [])]
      : [...this.connections.keys()];

    for (const id of targets) {
      if (!excluded.has(id)) this.send(id, message);
    }
  }

  // -------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------

  setMetadata(id: string, metadata: ConnectionMetadata): void {
    const conn = this.connections.get(id);
    if (!conn) return;
    conn.metadata = { ...conn.metadata, ...metadata };
  }

  getMetadata(id: string): ConnectionMetadata | undefined {
    return this.connections.get(id)?.metadata;
  }

  // -------------------------------------------------------------------------
  // Introspection
  // -------------------------------------------------------------------------

  get size(): number {
    return this.connections.size;
  }

  roomSize(room: string): number {
    return this.rooms.get(room)?.size ?? 0;
  }

  getRooms(id: string): string[] {
    return [...(this.connections.get(id)?.rooms ?? [])];
  }

  has(id: string): boolean {
    return this.connections.has(id);
  }
}

export const connectionManager = new ConnectionManager();
