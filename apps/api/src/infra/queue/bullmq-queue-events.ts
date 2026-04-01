import { QueueEvents as BullMQQueueEventsClass } from "bullmq";
import { QueueEventName, QueueEvents } from "@myapp/shared";

export type BullMQQueueEventsConfig = {
  connection: ConstructorParameters<typeof BullMQQueueEventsClass>[1] extends
    | { connection?: infer C }
    | undefined
    ? C
    : never;
};

export class BullMQQueueEvents implements QueueEvents {
  private queueEvents: BullMQQueueEventsClass;

  constructor(name: string, config: BullMQQueueEventsConfig) {
    this.queueEvents = new BullMQQueueEventsClass(name, {
      connection: config.connection,
    });
  }

  on(event: QueueEventName, handler: (jobId: string) => void): void {
    this.queueEvents.on(event, ({ jobId }: { jobId: string }) =>
      handler(jobId),
    );
  }

  async close(): Promise<void> {
    await this.queueEvents.close();
  }
}
