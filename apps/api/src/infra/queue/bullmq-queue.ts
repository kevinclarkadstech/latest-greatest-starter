import { Queue as BullMQQueueClass } from "bullmq";
import { JobOptions, Queue } from "@myapp/shared";

export type BullMQQueueConfig = {
  connection: ConstructorParameters<typeof BullMQQueueClass>[1] extends
    | { connection?: infer C }
    | undefined
    ? C
    : never;
};

export class BullMQQueue<JobName extends string, Data>
  implements Queue<JobName, Data>
{
  // BullMQ's add() uses conditional types (ExtractNameType / ExtractDataType)
  // that TypeScript cannot resolve for generic parameters. Using `any` here
  // is intentional and safe — our Queue<JobName, Data> interface enforces the
  // correct types at the call site.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: BullMQQueueClass<any, any, any>;

  constructor(name: string, config: BullMQQueueConfig) {
    this.queue = new BullMQQueueClass(name, {
      connection: config.connection,
    });
  }

  async add(name: JobName, data: Data, options?: JobOptions): Promise<void> {
    await this.queue.add(name, data, {
      ...(options?.delay !== undefined ? { delay: options.delay } : {}),
      ...(options?.attempts !== undefined ? { attempts: options.attempts } : {}),
      ...(options?.priority !== undefined ? { priority: options.priority } : {}),
    });
  }

  async pause(): Promise<void> {
    await this.queue.pause();
  }

  async resume(): Promise<void> {
    await this.queue.resume();
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
