import { Module } from '@nestjs/common';
import { PostsService } from '@src/posts/posts.service';
import { PostsController } from '@src/posts/posts.controller';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
