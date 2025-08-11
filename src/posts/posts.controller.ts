import { Body, Controller, Post, Version } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { API_VERSION_1 } from '@src/common/constants';
import { PostsService } from '@src/posts/posts.service';
import { DataApiResponseDto } from '@src/common/dtos/data.api.response';
import { CreatePostRequestDto } from '@src/posts/dtos/create.post.request';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Version(API_VERSION_1)
  async createPost(@Body() dto: CreatePostRequestDto): Promise<DataApiResponseDto<PostModel>> {
    const createdPost = await this.postsService.createPost(dto.content);

    return {
      success: true,
      data: createdPost,
      message: 'Post created successfully.',
    };
  }
}
