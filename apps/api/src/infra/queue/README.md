# Queue — BullMQ implementations

Concrete BullMQ implementations of the `Queue`, `Worker`, and `QueueEvents` interfaces from `@myapp/shared`. Each class is a thin wrapper that keeps BullMQ out of your application code.

See [`packages/shared/src/common/features/queue/README.md`](../../../../packages/shared/src/common/features/queue/README.md) for the interface definitions.

---

## Prerequisites

- A running Redis instance reachable from the API process
- `bullmq` is already listed as a dependency in `apps/api/package.json`

---

## Classes

### `BullMQQueue<JobName, Data>`

Wraps BullMQ's `Queue` class. All three implementations accept a `connection` config that is forwarded directly to BullMQ — use the same Redis connection options you pass elsewhere (host, port, password, TLS, etc.).

```ts
import { BullMQQueue } from "@myapp/api/infra/queue";
// or, from within apps/api:
import { BullMQQueue } from "./infra/queue";

const queue = new BullMQQueue<"send-email", { to: string }>("notifications", {
  connection: { host: "localhost", port: 6379 },
});

await queue.add("send-email", { to: "user@example.com" });

// With options
await queue.add(
  "send-email",
  { to: "user@example.com" },
  { delay: 5000, attempts: 3, priority: 1 },
);
```

### `BullMQWorker<JobName, Data>`

Wraps BullMQ's `Worker` class. The processor callback receives a plain `Job<JobName, Data>` object (from `@myapp/shared`) — not a BullMQ-specific object.

```ts
import { BullMQWorker } from "./infra/queue";

const worker = new BullMQWorker<"send-email", { to: string }>(
  "notifications",
  async (job) => {
    // job is typed as Job<"send-email", { to: string }>
    await sendEmail(job.data.to);
  },
  {
    connection: { host: "localhost", port: 6379 },
    concurrency: 10, // optional, defaults to BullMQ's default (1)
  },
);
```

### `BullMQQueueEvents`

Wraps BullMQ's `QueueEvents` class. Useful for logging, metrics, and alerting without importing BullMQ types in your observability layer.

```ts
import { BullMQQueueEvents } from "./infra/queue";

const events = new BullMQQueueEvents("notifications", {
  connection: { host: "localhost", port: 6379 },
});

events.on("completed", (jobId) => {
  logger.info({ jobId }, "Job completed");
});

events.on("failed", (jobId) => {
  logger.error({ jobId }, "Job failed");
});
```

Supported event names: `"completed"` | `"failed"` | `"active"` | `"stalled"`

---

## End-to-end example

```ts
import { createQueue } from "@myapp/shared";
import { BullMQQueue, BullMQWorker, BullMQQueueEvents } from "./infra/queue";

const connection = { host: process.env.REDIS_HOST, port: 6379 };

// 1. Define your job types
type EmailJobName = "send-welcome" | "send-reset-password";
type EmailJobData = { userId: string };

// 2. Create the queue (createQueue validates the implementation against the interface)
const emailQueue = createQueue(
  new BullMQQueue<EmailJobName, EmailJobData>("email", { connection }),
);

// 3. Enqueue jobs from anywhere in your application
await emailQueue.add("send-welcome", { userId: "abc123" });
await emailQueue.add("send-reset-password", { userId: "abc123" }, { attempts: 5 });

// 4. Create a worker to process them
const emailWorker = new BullMQWorker<EmailJobName, EmailJobData>(
  "email",
  async (job) => {
    if (job.name === "send-welcome") {
      await sendWelcomeEmail(job.data.userId);
    } else if (job.name === "send-reset-password") {
      await sendResetPasswordEmail(job.data.userId);
    }
  },
  { connection, concurrency: 5 },
);

// 5. Optionally observe lifecycle events
const emailEvents = new BullMQQueueEvents("email", { connection });
emailEvents.on("failed", (jobId) => logger.error({ jobId }, "Email job failed"));

// 6. Graceful shutdown
async function shutdown() {
  await emailQueue.close();
  await emailWorker.close();
  await emailEvents.close();
}
```

---

## Lifecycle management

All three classes expose `close()`. Call it during graceful shutdown to allow in-flight jobs to finish and release Redis connections.

`BullMQQueue` and `BullMQWorker` also expose `pause()` / `resume()` for temporarily halting processing (e.g. during deploys or maintenance windows).
