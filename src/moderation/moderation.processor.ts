import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ModerationJob } from '@src/moderation/types';
import { DatabaseService } from '@src/database/database.service';
import { Logger } from '@nestjs/common';

@Processor('moderation')
export class ModerationProcessor extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly logger = new Logger(ModerationProcessor.name),
  ) {
    super();
  }

  async process(job: Job<ModerationJob>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for post ${job.data.postId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error): void {
    if (job) {
      this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
    } else {
      this.logger.error(`Job failed with error: ${err.message}`);
    }
  }
}
