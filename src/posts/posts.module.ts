import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsService } from '@src/posts/posts.service';
import { PostsController } from '@src/posts/posts.controller';
import { MODERATION_QUEUE_NAME } from '@src/common/constants';
import { DatabaseModule } from '@src/database/database.module';
import { moderationQueueConfig } from '@src/common/queues.config';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: MODERATION_QUEUE_NAME,
      defaultJobOptions: moderationQueueConfig,
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
