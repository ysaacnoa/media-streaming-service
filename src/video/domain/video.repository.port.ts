
import { VideoEntity } from './video.entity';

export interface VideoRepositoryPort {
  create(video: VideoEntity): Promise<VideoEntity>;
  findById(id: string): Promise<VideoEntity | null>;
  findAll(): Promise<VideoEntity[]>;
}
