/**
 * Enum representing the possible states of a video during its lifecycle.
 */
export enum VideoStatus {
  /**
   * File was successfully uploaded but not yet processed.
   * Example: just received from the client, waiting for transcoding or chunking.
   */
  UPLOADED = 'uploaded',

  /**
   * File is currently being processed.
   * Example: transcoding with FFmpeg, generating thumbnails, or preparing adaptive streaming chunks.
   */
  PROCESSING = 'processing',

  /**
   * File has been processed and is ready for playback/streaming.
   * Example: transcoding completed, chunks generated, can be served via streaming endpoints.
   */
  PROCESSED = 'processed',

  /**
   * File processing failed (e.g., FFmpeg error, corrupted file).
   * Useful to display errors in the UI or trigger re-processing attempts.
   */
  FAILED = 'failed',
}


/**
 * Represents a stored video entity with metadata managed by the VideoModule.
 */
export interface VideoRecord {
  /** Unique identifier of the video (UUID v4). */
  id: string;

  /** Optional title provided by the client. */
  title: string | null;

  /** Original filename from the uploaded file. */
  originalName: string;

  /** The filename stored in the system. */
  filename: string;

  /** Full path where the file is stored on disk. */
  path: string;

  /** File size in bytes. */
  size: number;

  /** MIME type of the uploaded video (e.g., video/mp4). */
  mimeType: string;

  /** Current status of the video (e.g., uploaded, processed, failed). */
  status: VideoStatus;

  /** ISO string representing the creation date. */
  createdAt: string;
}
