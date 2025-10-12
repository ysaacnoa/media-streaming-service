import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRecord } from './types/video-record.type';
import { VideoService } from './video.service';
import { VideoUploadInterceptor } from './interceptor/video.interceptor';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  /**
   * Endpoint to upload a video file
   *
   * @param file - The uploaded video file (handled by Multer)
   * @param dto - Additional metadata for the video (e.g., title)
   * @returns The saved video metadata
   */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video file and metadata',
    type: CreateVideoDto,
  })
  @UseInterceptors(VideoUploadInterceptor)
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVideoDto,
  ): Promise<VideoRecord> {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    // Register the uploaded file using VideoService
    const videoRecord = await this.videoService.registerUploadedFile(file, dto);
    return videoRecord;
  }
}
