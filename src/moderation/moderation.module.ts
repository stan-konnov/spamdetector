import { Logger, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { DatabaseModule } from '@src/database/database.module';
import { MODERATION_QUEUE_NAME } from '@src/common/constants';
import { moderationQueueConfig } from '@src/common/queues.config';
import { ModerationProcessor } from '@src/moderation/moderation.processor';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: MODERATION_QUEUE_NAME,
      defaultJobOptions: moderationQueueConfig,
    }),
  ],
  providers: [Logger, ModerationProcessor],
  exports: [],
})
export class ModerationModule {}
