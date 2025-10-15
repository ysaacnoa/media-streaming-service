import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { VideoService } from './application/video.service';
import { VideoController } from './infraestructure/video.controller';
import { PrismaVideoRepositoryAdapter } from './infraestructure/prisma-video.repository.adapter';

@Module({
  imports: [StorageModule],
  controllers: [VideoController],
  providers: [VideoService, PrismaVideoRepositoryAdapter],
  exports: [VideoService]
})
export class VideoModule {}
