import { VideoStatus } from '@prisma/client';

export interface VideoParams {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  status?: VideoStatus;
  title?: string | null;
  createdAt?: Date;
}

export class VideoEntity {
  readonly id: string;
  readonly originalName: string;
  readonly filename: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url: string;
  readonly status: VideoStatus;
  readonly title: string | null;
  readonly createdAt: Date;

  constructor(params: VideoParams) {
    this.id = params.id;
    this.originalName = params.originalName;
    this.filename = params.filename;
    this.size = params.size;
    this.mimeType = params.mimeType;
    this.url = params.url;
    this.status = params.status ?? VideoStatus.UPLOADED;
    this.title = params.title ?? null;
    this.createdAt = params.createdAt ?? new Date();
  }
}
