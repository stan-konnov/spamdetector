import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { ModerationProcessor } from './moderation.processor';
import { MODERATION_QUEUE_NAME } from '@src/common/constants';
import { moderationQueueConfig } from '@src/common/queues.config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MODERATION_QUEUE_NAME,
      defaultJobOptions: moderationQueueConfig,
    }),
  ],
  providers: [ModerationProcessor],
  exports: [],
})
export class ModerationModule {}
