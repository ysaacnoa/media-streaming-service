import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './video/video.module';
import { AdaptiveStreamingModule } from './adaptive-streaming/adaptive-streaming.module';

@Module({
  imports: [VideoModule, AdaptiveStreamingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
