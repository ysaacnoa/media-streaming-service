import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { AdaptiveStreamingController } from './adaptive-streaming.controller';
import { AdaptiveStreamingService } from './adaptive-streaming.service';

@Module({
  imports: [StorageModule],
  providers: [AdaptiveStreamingService],
  controllers: [AdaptiveStreamingController]
})
export class AdaptiveStreamingModule {}
