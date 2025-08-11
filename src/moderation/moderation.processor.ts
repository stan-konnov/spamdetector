import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { ModerationJob } from '@src/moderation/types';
import { MODERATION_QUEUE_NAME } from '@src/common/constants';

@Processor(MODERATION_QUEUE_NAME)
export class ModerationProcessor extends WorkerHost {
  private readonly logger = new Logger(ModerationProcessor.name);

  constructor() {
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
