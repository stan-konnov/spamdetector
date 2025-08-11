import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { PostStatus } from '@prisma/client';
import { ModerationVerdict } from '@src/moderation/types';
import { DatabaseService } from '@src/database/database.service';
import { buildModerationPrompt } from '@src/moderation/helpers/build.moderation.prompt';
import {
  ModerationServiceError,
  CallToOllamaApiFailedError,
  PostToModerateDoesNotExistError,
} from '@src/moderation/errors';

@Injectable()
export class ModerationService {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly database: DatabaseService,
  ) {}

  async moderateAndPersist(postId: string, postContent: string): Promise<void> {
    const postToModerate = await this.database.post.findUnique({
      where: { id: postId, status: PostStatus.PENDING },
    });

    if (!postToModerate) {
      throw new PostToModerateDoesNotExistError(
        `Post with ID ${postId} does not exist or is not pending.`,
      );
    }

    try {
      const moderationVerdict = await this.generateModerationVerdict(postContent);

      const statusAfterModeration =
        moderationVerdict.spam || moderationVerdict.abuse || moderationVerdict.sensitive
          ? PostStatus.FLAGGED
          : PostStatus.SAFE;

      await this.database.post.update({
        where: { id: postId },
        data: {
          status: statusAfterModeration,
          verdict: JSON.stringify(moderationVerdict),
        },
      });
    } catch (error: unknown) {
      throw new ModerationServiceError(
        `Moderation for post ${postId} failed with ${error instanceof Error ? error.message : 'Unknown error'}.`,
      );
    }
  }

  async generateModerationVerdict(postContent: string): Promise<ModerationVerdict> {
    try {
      const { data } = await axios.post(this.config.get<string>('OLLAMA_API_URL')!, {
        model: this.config.get<string>('LLM_MODEL_NAME'),
        prompt: buildModerationPrompt(postContent),
        stream: false,
      });

      return JSON.parse(data) as ModerationVerdict;
    } catch (error: unknown) {
      throw new CallToOllamaApiFailedError(
        `Call to Ollama API failed with: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
