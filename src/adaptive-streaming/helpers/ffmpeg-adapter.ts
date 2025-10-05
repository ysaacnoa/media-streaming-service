import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as util from 'util';
import * as child_process from 'child_process';
import * as fs from 'fs';

const exec = util.promisify(child_process.exec);

export interface VideoResolution {
  width: number;
  height: number;
}

export interface Rendition {
  name: string;
  width: number;
  height: number;
  bitrate: string;
}

/**
 * FfmpegAdapter provides utilities to work with video files through FFmpeg and FFprobe.
 * It supports:
 *  - Extracting native video resolution
 *  - Generating multiple renditions (bitrates/resolutions)
 *  - Converting videos to HLS adaptive streams
 */
export class FfmpegAdapter {
  /**
   * Extracts the native resolution of a video using `ffprobe`.
   *
   * @param {string} inputPath - Path to the input video file.
   * @returns {Promise<VideoResolution>} - The detected resolution `{ width, height }`.
   *
   * @example
   * const resolution = await FfmpegAdapter.getVideoResolution("video.mp4");
   * // -> { width: 1920, height: 1080 }
   */
  static async getVideoResolution(inputPath: string): Promise<VideoResolution> {
    const { stdout } = await exec(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`,
    );

    const [w, h] = stdout.trim().split(',').map(Number);

    if (!w || !h) {
      throw new Error(`Could not parse resolution from ffprobe output: "${stdout}"`);
    }

    return { width: w, height: h };
  }

  /**
   * Generates safe renditions (scaled versions of the original resolution).
   * - Ensures width and height are even (required by H.264).
   * - Filters out renditions that are too small (< 180px).
   *
   * @param {number} baseWidth - Original video width.
   * @param {number} baseHeight - Original video height.
   * @returns {Rendition[]} - List of renditions with safe dimensions and bitrates.
   *
   * @example
   * const renditions = FfmpegAdapter.getRenditions(1920, 1080);
   * // [
   * //   { name: "max", width: 1920, height: 1080, bitrate: "800k" },
   * //   { name: "med", width: 1440, height: 810, bitrate: "500k" },
   * //   { name: "low", width: 960, height: 540, bitrate: "250k" }
   * // ]
   */
  static getRenditions(baseWidth: number, baseHeight: number): Rendition[] {
    const makeEven = (n: number) => (n % 2 === 0 ? n : n - 1);

    const renditions: Rendition[] = [
      {
        name: 'max',
        width: makeEven(baseWidth),
        height: makeEven(baseHeight),
        bitrate: '800k',
      },
      {
        name: 'med',
        width: makeEven(Math.round(baseWidth * 0.75)),
        height: makeEven(Math.round(baseHeight * 0.75)),
        bitrate: '500k',
      },
      {
        name: 'low',
        width: makeEven(Math.round(baseWidth * 0.5)),
        height: makeEven(Math.round(baseHeight * 0.5)),
        bitrate: '250k',
      },
    ];

    return renditions.filter((r) => r.width >= 180 && r.height >= 180);
  }

  /**
   * Runs FFmpeg to convert a video into an HLS adaptive stream.
   *
   * Flow:
   *  1. Takes multiple renditions with different resolutions/bitrates.
   *  2. Maps video/audio streams per rendition.
   *  3. Produces an HLS master playlist (`master.m3u8`) with child playlists for each rendition.
   *
   * @param {string} inputPath - Path to the input video file.
   * @param {string} outputDir - Directory where the `.m3u8` and segment files will be stored.
   * @param {Rendition[]} renditions - Renditions to generate.
   * @returns {ChildProcessWithoutNullStreams} - The spawned FFmpeg process.
   *
   * @example
   * const resolution = await FfmpegAdapter.getVideoResolution("video.mp4");
   * const renditions = FfmpegAdapter.getRenditions(resolution.width, resolution.height);
   * const ffmpegProcess = FfmpegAdapter.runHlsConversion("video.mp4", "output/hls", renditions);
   *
   * ffmpegProcess.on("close", (code) => {
   *   console.log("FFmpeg process exited with code", code);
   * });
   */
  static runHlsConversion(
    inputPath: string,
    outputDir: string,
    renditions: Rendition[],
  ): ChildProcessWithoutNullStreams {
    fs.mkdirSync(outputDir, { recursive: true });

    const args: string[] = [
      '-i', inputPath,
      '-preset', 'veryfast',
      '-g', '48',
      '-sc_threshold', '0',
    ];

    renditions.forEach((r, i) => {
      args.push(
        '-map', '0:v:0',
        '-map', '0:a?',
        `-c:v:${i}`, 'h264',
        `-b:v:${i}`, r.bitrate,
        `-s:v:${i}`, `${r.width}x${r.height}`,
        `-profile:v:${i}`, 'main',
        '-crf', '20',
        `-c:a:${i}`, 'aac',
        `-b:a:${i}`, '96k',
      );
    });

    args.push(
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_playlist_type', 'vod',
      '-hls_flags', 'independent_segments',
      '-master_pl_name', 'master.m3u8',
      '-var_stream_map', renditions.map((_, i) => `v:${i},a:${i}`).join(' '),
      `${outputDir}/index_%v.m3u8`,
    );

    return spawn('ffmpeg', args);
  }
}
