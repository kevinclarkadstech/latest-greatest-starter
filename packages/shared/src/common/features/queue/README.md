# Queue — shared interfaces

Generic, provider-agnostic queue interfaces exported from `@myapp/shared`. Concrete implementations live in each app (e.g. `apps/api/src/infra/queue/`).

---

## Types

### `JobOptions`

Options passed when enqueuing a job.

| Field | Type | Description |
|---|---|---|
| `delay` | `number` (optional) | Milliseconds to wait before the job becomes eligible to run |
| `attempts` | `number` (optional) | Maximum number of attempts before the job is marked as failed |
| `priority` | `number` (optional) | Lower values run first |

### `Job<JobName, Data>`

A plain data shape describing a job received by a worker processor. Not a class — never instantiated directly.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique job identifier assigned by the queue |
| `name` | `JobName` | The job name used to discriminate job types |
| `data` | `Data` | The payload passed to `Queue.add()` |
| `attemptsMade` | `number` | How many times this job has been attempted so far |

---

## Interfaces

### `Queue<JobName, Data>`

Enqueue jobs and control the queue lifecycle.

```ts
type Queue<JobName extends string, Data> = {
  add(name: JobName, data: Data, options?: JobOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  close(): Promise<void>;
};
```

### `Worker<JobName, Data>`

Consumes jobs from the queue.

```ts
type Worker<JobName extends string, Data> = {
  pause(): Promise<void>;
  resume(): Promise<void>;
  close(): Promise<void>;
};
```

### `QueueEvents`

Observe job lifecycle events without coupling to queue internals. Useful for logging, metrics, and alerting.

```ts
type QueueEventName = "completed" | "failed" | "active" | "stalled";

type QueueEvents = {
  on(event: QueueEventName, handler: (jobId: string) => void): void;
  close(): Promise<void>;
};
```

---

## `createQueue` factory

A pass-through helper that mirrors `createCache`. Its primary purpose is to provide a typed construction point where TypeScript can verify that an implementation satisfies the `Queue` interface.

```ts
import { createQueue } from "@myapp/shared";

const queue = createQueue(new BullMQQueue("my-queue", { connection }));
```

---

## Defining your job types

The recommended pattern is to define a discriminated union of job names and a corresponding data map, then derive the `Queue` / `Worker` types from them:

```ts
// jobs.ts
type EmailJobName = "send-welcome" | "send-reset-password";

type EmailJobData = {
  "send-welcome": { userId: string };
  "send-reset-password": { userId: string; token: string };
};

// Use a single union type for the data so the Queue/Worker are typed correctly
type EmailData = EmailJobData[EmailJobName];

// Typed queue and worker
type EmailQueue = Queue<EmailJobName, EmailData>;
type EmailWorker = Worker<EmailJobName, EmailData>;
```
