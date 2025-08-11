import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { ModerationJob } from '@src/moderation/types';
import { MODERATION_QUEUE_NAME } from '@src/common/constants';
import { DatabaseService } from '@src/database/database.service';

@Processor(MODERATION_QUEUE_NAME)
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
    this.logger.error(`Job (id?: ${job?.id ?? 'none'}) failed with error: ${err.message}`);
  }
}
