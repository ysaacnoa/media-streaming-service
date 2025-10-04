import { diskStorage, Options, FileFilterCallback } from 'multer';
import { extname } from 'path';
import { STORAGE_PATHS } from 'src/config/storage.config';
import { Request } from 'express';

/**
 * MulterAdapter acts as a centralized helper for configuring Multer
 * for video uploads in the VideoModule.
 *
 * This isolates Multer logic from controllers/services and provides
 * typed, reusable configurations for file storage, filtering, and limits.
 */
export class MulterAdapter {
  /**
   * Returns a configured Multer `Options` object for handling video uploads.
   *
   * @param maxSizeMB - Maximum allowed file size in megabytes (default: 100MB)
   * @returns A Multer configuration object to be used in `FileInterceptor`
   *
   * Example usage in a controller:
   * ```ts
   * @Post('upload')
   * @UseInterceptors(FileInterceptor('file', MulterAdapter.videoUploadOptions()))
   * uploadVideo(@UploadedFile() file: Express.Multer.File) { ... }
   * ```
   */
  static videoUploadOptions(maxSizeMB = 100): Options {
    return {
      /** Storage configuration: defines where and how files are saved */
      storage: diskStorage({
        /** Destination folder on disk where uploaded files are stored */
        destination: STORAGE_PATHS.uploads,

        /**
         * Generates a unique filename for each uploaded file.
         *
         * @param _req - The incoming request object (unused here)
         * @param file - The uploaded file object provided by Multer
         * @param callback - Callback to signal Multer the final filename
         */
        filename: (
          _req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),

      /**
       * Validates uploaded files before saving.
       *
       * Only files with a MIME type starting with "video/" are accepted.
       * If the file is invalid, the callback receives `false` and Multer rejects the upload.
       */
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        callback: FileFilterCallback,
      ) => {
        if (file.mimetype.startsWith('video/')) callback(null, true);
        else callback(null, false);
      },

      /**
       * Limits configuration for uploaded files
       * Currently sets the maximum file size allowed in bytes
       */
      limits: { fileSize: maxSizeMB * 1024 * 1024 },
    };
  }
}
