// src/video/dto/create-video.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ description: 'Optional title for the video', required: false })
  @IsOptional()
  @IsString()
  title?: string;
}

