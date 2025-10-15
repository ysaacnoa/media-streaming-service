import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { VideoService } from '../application/video.service';
import { CreateVideoDto } from '../application/create-video.dto';
import { VideoEntity } from '../domain/video.entity';
import { VideoUploadInterceptor } from './video-upload.interceptor';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVideoDto })
  @UseInterceptors(VideoUploadInterceptor)
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVideoDto,
  ): Promise<VideoEntity> {
    if (!file) throw new BadRequestException('Video file is required');

    return await this.videoService.registerUploadedFile(file, dto);
  }

  @Get(':id')
  async getVideo(@Param('id') id: string): Promise<VideoEntity> {
    const video = await this.videoService.getVideoById(id);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  @Get()
  async listVideos(): Promise<VideoEntity[]> {
    return this.videoService.getAllVideos();
  }
}
