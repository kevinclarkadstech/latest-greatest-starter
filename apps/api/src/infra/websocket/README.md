# WebSocket / Realtime

Built on [`@hono/node-server`](https://github.com/honojs/node-server) WebSocket support. The `ConnectionManager` class is a singleton that tracks every live connection and makes it easy to push events from anywhere in the API.

## Connection endpoint

```
ws://localhost:3000/ws
```

On connect the server immediately sends:

```json
{ "type": "connected", "payload": { "id": "<uuid>" } }
```

---

## ConnectionManager API

Import the singleton from anywhere in the API:

```ts
import { connectionManager } from "../infra/websocket";
```

### Lifecycle

| Method | Description |
|---|---|
| `add(id, socket, metadata?)` | Register a new connection. Called automatically by the WS route. |
| `remove(id)` | Disconnect and clean up. Also fires automatically on socket `close`. |

### Rooms

| Method | Description |
|---|---|
| `join(id, room)` | Add a connection to a named room. |
| `leave(id, room)` | Remove a connection from a room. |

### Sending

| Method | Description |
|---|---|
| `send(id, message)` | Send to a single connection. Returns `false` if the socket is closed. |
| `broadcast(message, { room?, exclude? })` | Send to all connections, or scope to a room. Optionally exclude one or more IDs. |

### Metadata

| Method | Description |
|---|---|
| `setMetadata(id, metadata)` | Merge arbitrary data onto a connection (e.g. `{ userId, role }`). |
| `getMetadata(id)` | Retrieve the stored metadata for a connection. |

### Introspection

| Method | Description |
|---|---|
| `has(id)` | Check if a connection exists. |
| `size` | Total number of live connections. |
| `roomSize(room)` | Number of connections in a room. |
| `getRooms(id)` | List of rooms a connection has joined. |

---

## Client → Server messages

All messages are JSON.

| Message | Effect |
|---|---|
| `{ "type": "ping" }` | Server replies `{ "type": "pong" }` |
| `{ "type": "join", "room": "orders" }` | Join a room. Server replies `{ "type": "joined", "payload": { "room", "size" } }` |
| `{ "type": "leave", "room": "orders" }` | Leave a room. Server replies `{ "type": "left", "payload": { "room" } }` |
| `{ "type": "message", "room": "orders", "payload": {} }` | Broadcast `payload` to all other connections in the room. |

---

## Pushing events from elsewhere in the API

Because `connectionManager` is a plain singleton you can import it from any tRPC router, REST route, background job, etc.

```ts
import { connectionManager } from "../infra/websocket";

// Notify everyone in a room (e.g. after a DB write)
connectionManager.broadcast(
  { type: "order_updated", payload: order },
  { room: "orders" }
);

// Notify a specific user
connectionManager.send(userId, {
  type: "notification",
  payload: { text: "Your export is ready." },
});

// Tag a connection with user info after auth
connectionManager.setMetadata(connectionId, { userId: session.user.id });
```

---

## Scaling beyond a single process

The `ConnectionManager` stores connections in memory, so it only works within a single Node process. For multi-instance deployments, replace the broadcast logic with a Redis Pub/Sub adapter — each instance subscribes to a shared channel and forwards messages to its own local connections.
