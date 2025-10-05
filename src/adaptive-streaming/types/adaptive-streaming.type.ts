export enum AdaptiveStreamingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AdaptiveStreamingJob {
  id: string;
  inputPath: string;
  outputDir: string;
  status: AdaptiveStreamingStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}
