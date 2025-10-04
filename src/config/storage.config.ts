import * as path from 'path';

/**
 * Centralized storage paths for uploaded videos and metadata.
 * This avoids magic strings across the codebase.
 */
export const STORAGE_PATHS = {
  /** Base storage folder */
  base: 'storage',

  /** Directory for uploaded files */
  uploads: path.join('storage', 'uploads'),

  /** Directory for metadata JSON files */
  meta: path.join('storage', 'meta'),

  /**
   * Resolve the full path for a given uploaded filename.
   * Always uses forward slashes, safe for frontend consumption.
   * @param filename The uploaded file's name
   * @returns Full path to the stored file
   */
  getUploadPath: (filename: string) =>
    path.join(STORAGE_PATHS.uploads, filename).split(path.sep).join('/'),

  /**
   * Resolve the full path for a video's metadata JSON file.
   * Always uses forward slashes.
   * @param id The video ID (UUID)
   * @returns Full path to the metadata JSON file
   */
  getMetaPath: (id: string) =>
    path.join(STORAGE_PATHS.meta, `${id}.json`).split(path.sep).join('/'),
};
