import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsModule } from '@src/posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL') },
      }),
    }),
    BullModule.registerQueueAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: config.get<string>('QUEUE_NAME'),
      }),
    }),
    PostsModule,
  ],
})
export class AppModule {}
