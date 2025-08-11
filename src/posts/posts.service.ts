import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Post, PostStatus } from '@prisma/client';

import { MODERATE_QUEUE_ACTION, MODERATION_QUEUE_NAME } from '@src/common/constants';
import { DatabaseService } from '@src/database/database.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly database: DatabaseService,
    @InjectQueue(MODERATION_QUEUE_NAME) private readonly moderationQueue: Queue,
  ) {}

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
        postContent: createdPost.content,
      },
      {
        jobId: createdPost.id,
      },
    );

    return createdPost;
  }
}
