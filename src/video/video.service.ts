import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import { CreateVideoDto } from './dto/create-video.dto';
import { STORAGE_PATHS } from 'src/config/storage.config';
import { VideoRecord, VideoStatus } from './types/video-record.type';

/**
 * Service responsible for handling video file registration
 * and metadata persistence for uploaded videos.
 */
@Injectable()
export class VideoService {
  /**
   * Registers a newly uploaded video file by generating a unique identifier,
   * extracting its metadata, and saving that metadata to a JSON file on disk.
   *
   * @param file - The uploaded file object provided by Multer (includes buffer, size, mimetype, etc.)
   * @param dto - Data transfer object containing additional metadata about the video (e.g., title)
   * @returns A Promise that resolves to a {@link VideoRecord} containing all metadata about the uploaded video
   *
   * @example
   * const record = await videoService.registerUploadedFile(file, { title: "My Video" });
   * console.log(record.id); // => "550e8400-e29b-41d4-a716-446655440000"
   */
  async registerUploadedFile(
    file: Express.Multer.File,
    dto: CreateVideoDto,
  ): Promise<VideoRecord> {
    const id = uuidv4();

    // Build paths using centralized config helpers
    const storagePath = STORAGE_PATHS.getUploadPath(file.filename);
    const metaPath = STORAGE_PATHS.getMetaPath(id);

    const record: VideoRecord = {
      id,
      title: dto.title ?? null,
      originalName: file.originalname,
      filename: file.filename,
      path: storagePath,
      size: file.size,
      mimeType: file.mimetype,
      status: VideoStatus.UPLOADED,
      createdAt: new Date().toISOString(),
    };

    // Ensure directories exist
    await fs.ensureDir(STORAGE_PATHS.uploads);
    await fs.ensureDir(STORAGE_PATHS.meta);

    // Persist metadata to disk as JSON
    await fs.writeJson(metaPath, record, { spaces: 2 });

    return record;
  }
}
