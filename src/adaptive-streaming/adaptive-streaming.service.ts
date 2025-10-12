import { Injectable } from '@nestjs/common';
import { FfmpegAdapter } from 'src/adaptive-streaming/helpers/ffmpeg-adapter';
import { StorageService } from 'src/storage/storage.service';
import {
  AdaptiveStreamingJob,
  AdaptiveStreamingStatus,
} from './types/adaptive-streaming.type';

/**
 * AdaptiveStreamingService manages the lifecycle of adaptive video streaming jobs.
 *
 * Responsibilities:
 * - Receives a video file and prepares HLS adaptive streams (multiple resolutions/bitrates).
 * - Tracks job state transitions (pending → processing → completed/failed).
 * - Persists job state in-memory (Map), allowing status retrieval by job ID.
 *
 * Works in conjunction with:
 * - {@link FfmpegAdapter} for FFmpeg/FFprobe low-level operations.
 * - {@link StorageService} for filesystem output paths.
 */
@Injectable()
export class AdaptiveStreamingService {
  /**
   * In-memory store for all adaptive streaming jobs.
   * Key: job ID
   * Value: {@link AdaptiveStreamingJob}
   */
  private jobs: Map<string, AdaptiveStreamingJob> = new Map();

  constructor(private readonly storage: StorageService) {}

  /**
   * Starts processing a video for adaptive streaming.
   *
   * Flow:
   *  1. Creates a job entry with status `PENDING`.
   *  2. Ensures the HLS output directory exists.
   *  3. Detects the source video resolution using {@link FfmpegAdapter.getVideoResolution}.
   *  4. Generates safe renditions for multiple resolutions/bitrates.
   *  5. Updates job status → `PROCESSING`.
   *  6. Spawns an FFmpeg process with {@link FfmpegAdapter.runHlsConversion}.
   *  7. On FFmpeg exit:
   *      - status → `COMPLETED` if success
   *      - status → `FAILED` with error message if non-zero exit code
   *
   * @param {string} id - Unique identifier for the job.
   * @param {string} inputPath - Path to the source video file.
   * @returns {Promise<AdaptiveStreamingJob>} - The initialized job with status updates.
   *
   * @example
   * const job = await adaptiveStreamingService.processVideo(
   *   "abc123",
   *   "storage/uploads/video.mp4"
   * );
   *
   * // Check status
   * console.log(job.status); // -> PENDING (initially)
   *
   * // Later, poll status:
   * const latest = adaptiveStreamingService.getJobStatus("abc123");
   * console.log(latest?.status); // -> PROCESSING / COMPLETED / FAILED
   */
  async processVideo(
    id: string,
    inputPath: string,
  ): Promise<AdaptiveStreamingJob> {
    const outputDir = this.storage.getHlsPath(id);
    await this.storage.ensureDir(outputDir);

    const job: AdaptiveStreamingJob = {
      id,
      inputPath,
      outputDir,
      status: AdaptiveStreamingStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(id, job);

    // Step 1: Get original resolution
    const { width, height } = await FfmpegAdapter.getVideoResolution(inputPath);

    // Step 2: Generate renditions for adaptive streaming
    const renditions = FfmpegAdapter.getRenditions(width, height);

    // Step 3: Update job status → PROCESSING
    job.status = AdaptiveStreamingStatus.PROCESSING;
    job.updatedAt = new Date().toISOString();

    // Step 4: Run FFmpeg
    const ffmpeg = FfmpegAdapter.runHlsConversion(
      inputPath,
      outputDir,
      renditions,
    );

    // Step 5: Listen for process completion
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        job.status = AdaptiveStreamingStatus.COMPLETED;
      } else {
        job.status = AdaptiveStreamingStatus.FAILED;
        job.error = `FFmpeg failed with code ${code}`;
      }
      job.updatedAt = new Date().toISOString();
      this.jobs.set(id, job);
    });

    return job;
  }

  /**
   * Retrieves the current state of a job by its ID.
   *
   * @param {string} id - The job ID.
   * @returns {AdaptiveStreamingJob | null} - The job object if found, otherwise `null`.
   *
   * @example
   * const status = adaptiveStreamingService.getJobStatus("abc123");
   * if (!status) {
   *   console.log("Job not found");
   * } else {
   *   console.log(status.status); // PENDING / PROCESSING / COMPLETED / FAILED
   * }
   */
  getJobStatus(id: string): AdaptiveStreamingJob | null {
    return this.jobs.get(id) ?? null;
  }
}
