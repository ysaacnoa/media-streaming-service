import {
  Controller,
  Post,
  Param,
  Get,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { AdaptiveStreamingService } from './adaptive-streaming.service';
import { VideoRecord } from 'src/video/types/video-record.type';
import * as path from 'path';
import { StorageService } from 'src/storage/storage.service';

/**
 * AdaptiveStreamingController
 *
 * Exposes HTTP endpoints for:
 *  - starting adaptive (HLS) processing for a given uploaded video
 *  - querying processing status
 *  - serving generated HLS playlist (.m3u8) and media segments (.ts)
 *
 * The controller delegates heavy lifting to:
 *  - AdaptiveStreamingService (manages jobs & calls FFmpegAdapter)
 *  - StorageService resolving filesystem paths
 *
 * Flow overview:
 *  1. Client uploads a video file (handled by another module).
 *  2. Client calls `POST /adaptive-streaming/:id/process` to start adaptive conversion.
 *  3. Client polls `GET /adaptive-streaming/:id/status` for job progress.
 *  4. Client plays video by fetching `GET /adaptive-streaming/:id/master.m3u8`
 *     and subsequent `.ts` segments.
 *
 * ⚠️ Notes:
 *  - This implementation serves HLS files directly from local disk.
 *    For production, serve from a CDN or configure static file middleware.
 *  - Status information is kept in memory by the service. If the process restarts,
 *    jobs will be lost unless persisted to a database/queue.
 */
@Controller('adaptive-streaming')
export class AdaptiveStreamingController {
  constructor(
    private readonly adaptiveStreamingService: AdaptiveStreamingService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Start adaptive (HLS) processing for an uploaded video.
   *
   * Reads video metadata from JSON (stored during upload), resolves
   * the original file path, and delegates to `AdaptiveStreamingService.processVideo`.
   *
   * @param {string} id - Unique video identifier
   * @returns {Promise<any>} - The AdaptiveStreamingJob object (status may be PENDING/PROCESSING initially)
   *
   * @example
   * // Start adaptive processing for video with id "abc123"
   * curl -X POST http://localhost:3000/adaptive-streaming/abc123/process
   *
   * @throws {NotFoundException} - If the video metadata JSON or file cannot be found
   */
  @Post(':id/process')
  async processVideo(@Param('id') id: string): Promise<any> {
    const videoMetaPath = this.storage.getMetaPath(id);

    try {
      const video: VideoRecord = await this.storage.readJson(videoMetaPath);
      const filePath = this.storage.getUploadPath(video.filename);
      return this.adaptiveStreamingService.processVideo(id, filePath);
    } catch {
      throw new NotFoundException(`Video ${id} not found`);
    }
  }

  /**
   * Query processing status for a video job.
   *
   * Returns the job record (id, inputPath, outputDir, status, timestamps, error?).
   *
   * @param {string} id - Video id
   * @returns {any} - Job object
   *
   * @example
   * curl http://localhost:3000/adaptive-streaming/abc123/status
   *
   * Response:
   * {
   *   "id": "abc123",
   *   "status": "processing",
   *   "createdAt": "2025-10-04T01:23:45.678Z",
   *   "updatedAt": "2025-10-04T01:24:00.123Z"
   * }
   *
   * @throws {NotFoundException} - If no job exists for the given id
   */
  @Get(':id/status')
  getStatus(@Param('id') id: string): any {
    const job = this.adaptiveStreamingService.getJobStatus(id);
    if (!job) throw new NotFoundException(`Job for video ${id} not found`);
    return job;
  }

  /**
   * Serve processed HLS files for playback.
   *
   * Serves both:
   *  - master playlist (`master.m3u8`)
   *  - rendition playlists (`index_0.m3u8`, `index_1.m3u8`, etc.)
   *  - media segments (`.ts` files)
   *
   * @param {string} id - Video id (output directory name)
   * @param {string} file - Filename requested (e.g. "master.m3u8" or "index_0.m3u8")
   * @returns {Promise<StreamableFile>} - Raw file stream
   *
   * @example
   * // Fetch master playlist for playback
   * curl http://localhost:3000/adaptive-streaming/abc123/master.m3u8
   *
   * // Fetch first media segment
   * curl http://localhost:3000/adaptive-streaming/abc123/segment0.ts
   *
   * @throws {NotFoundException} - If the requested file does not exist
   */
  @Get(':id/:file')
  async serveFile(
    @Param('id') id: string,
    @Param('file') file: string,
  ): Promise<StreamableFile> {
    const filePath = this.storage.normalize(
      path.join(this.storage.getHlsPath(id), file),
    );

    if (!(await this.storage.pathExists(filePath))) {
      throw new NotFoundException(`File ${file} not found for video ${id}`);
    }

    const buffer = await this.storage.readFile(filePath);
    return new StreamableFile(buffer);
  }
}
