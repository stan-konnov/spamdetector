import { Module } from '@nestjs/common';
import { PostsService } from '@src/posts/posts.service';
import { PostsController } from '@src/posts/posts.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
