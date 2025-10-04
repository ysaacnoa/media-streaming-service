import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { MulterAdapter } from './helpers/multer-adapter';
import { VideoRecord } from './types/video-record.type';

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
  @UseInterceptors(FileInterceptor('file', MulterAdapter.videoUploadOptions()))
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
