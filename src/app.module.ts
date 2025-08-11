import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsModule } from '@src/posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModerationModule } from '@src/moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL') },
      }),
    }),
    PostsModule,
    ModerationModule,
  ],
})
export class AppModule {}
