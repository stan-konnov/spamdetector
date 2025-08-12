import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { ModerationJob } from '@src/moderation/types';
import { ModerationService } from '@src/moderation/moderation.service';
import { MODERATION_QUEUE_NAME, N_CONCURRENT_PROCESSES } from '@src/common/constants';

@Processor(MODERATION_QUEUE_NAME, { concurrency: N_CONCURRENT_PROCESSES })
export class ModerationProcessor extends WorkerHost {
  constructor(
    private readonly logger: Logger,
    private readonly moderationService: ModerationService,
  ) {
    super();
  }

  async process(job: Job<ModerationJob>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for post ${job.data.postId}.`);

    try {
      await this.moderationService.moderateCreatedPost(job.data.postId, job.data.postContent);
      this.logger.log(`Job ${job.id} processed successfully.`);
    } catch (error: unknown) {
      this.logger.error(
        `Job ${job.id} failed with error: ${error instanceof Error ? error.message : 'Unknown error'}.`,
      );

      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error): void {
    this.logger.error(`Job (id?: ${job?.id ?? 'none'}) failed with error: ${err.message}.`);
  }
}
