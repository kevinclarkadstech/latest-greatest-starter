export type JobOptions = {
  delay?: number;
  attempts?: number;
  priority?: number;
};

export type Job<JobName extends string, Data> = {
  id: string;
  name: JobName;
  data: Data;
  attemptsMade: number;
};

export type Queue<JobName extends string, Data> = {
  add(name: JobName, data: Data, options?: JobOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  close(): Promise<void>;
};

export type Worker<JobName extends string, Data> = {
  pause(): Promise<void>;
  resume(): Promise<void>;
  close(): Promise<void>;
};

export type QueueEventName = "completed" | "failed" | "active" | "stalled";

export type QueueEvents = {
  on(event: QueueEventName, handler: (jobId: string) => void): void;
  close(): Promise<void>;
};

export function createQueue<JobName extends string, Data>(
  implementation: Queue<JobName, Data>,
): Queue<JobName, Data> {
  return implementation;
}
