import { Module } from '@nestjs/common';
import { AdaptiveStreamingService } from './adaptive-streaming.service';
import { AdaptiveStreamingController } from './adaptive-streaming.controller';

@Module({
  providers: [AdaptiveStreamingService],
  controllers: [AdaptiveStreamingController]
})
export class AdaptiveStreamingModule {}
