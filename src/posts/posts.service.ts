import { Injectable } from '@nestjs/common';
import { Post, PostStatus } from '@prisma/client';

import { DatabaseService } from '@src/database/database.service';

@Injectable()
export class PostsService {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly database: DatabaseService) {}

  async createPost(content: string): Promise<Post> {
    return await this.database.post.create({
      data: {
        content,
        status: PostStatus.PENDING,
      },
    });
  }
}
