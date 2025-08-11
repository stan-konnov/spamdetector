import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Post, PostStatus } from '@prisma/client';

import { MODERATE_QUEUE_ACTION } from '@src/common/constants';
import { moderationQueueConfig } from '@src/common/queue.config';
import { DatabaseService } from '@src/database/database.service';

@Injectable()
export class PostsService {
  private readonly moderationQueue: Queue;

  constructor(
    private readonly config: ConfigService,
    private readonly database: DatabaseService,
  ) {
    this.moderationQueue = new Queue(this.config.get<string>('QUEUE_NAME')!, {
      connection: { url: this.config.get('REDIS_URL') },
    });
  }

  async createPost(content: string): Promise<Post> {
    const createdPost = await this.database.post.create({
      data: {
        content,
        status: PostStatus.PENDING,
      },
    });

    await this.moderationQueue.add(
      MODERATE_QUEUE_ACTION,
      {
        postId: createdPost.id,
        content: createdPost.content,
      },
      {
        jobId: createdPost.id,
        ...moderationQueueConfig,
      },
    );

    return createdPost;
  }
}
