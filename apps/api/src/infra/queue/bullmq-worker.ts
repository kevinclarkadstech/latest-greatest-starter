import { Worker as BullMQWorkerClass } from "bullmq";
import { Job, Worker } from "@myapp/shared";

export type BullMQWorkerProcessor<JobName extends string, Data> = (
  job: Job<JobName, Data>,
) => Promise<void>;

export type BullMQWorkerConfig = {
  connection: ConstructorParameters<typeof BullMQWorkerClass>[2] extends
    | { connection?: infer C }
    | undefined
    ? C
    : never;
  concurrency?: number;
};

export class BullMQWorker<JobName extends string, Data>
  implements Worker<JobName, Data>
{
  private worker: BullMQWorkerClass<Data, void, JobName>;

  constructor(
    name: string,
    processor: BullMQWorkerProcessor<JobName, Data>,
    config: BullMQWorkerConfig,
  ) {
    this.worker = new BullMQWorkerClass<Data, void, JobName>(
      name,
      async (bullJob) => {
        await processor({
          id: bullJob.id ?? "",
          name: bullJob.name,
          data: bullJob.data,
          attemptsMade: bullJob.attemptsMade,
        });
      },
      {
        connection: config.connection,
        ...(config.concurrency !== undefined
          ? { concurrency: config.concurrency }
          : {}),
      },
    );
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  async resume(): Promise<void> {
    this.worker.resume();
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
