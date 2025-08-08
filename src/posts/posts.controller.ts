import { Body, Controller, Post } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { PostsService } from '@src/posts/posts.service';
import { DataApiResponseDto } from '@src/common/dtos/data.api.response';
import { CreatePostRequestDto } from '@src/posts/dtos/create.post.request';

@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(@Body() dto: CreatePostRequestDto): Promise<DataApiResponseDto<PostModel>> {
    const createdPost = await this.postsService.createPost(dto.content);

    return {
      success: true,
      data: createdPost,
      message: 'Post created successfully',
    };
  }
}
