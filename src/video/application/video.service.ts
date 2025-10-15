import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { VideoEntity } from '../domain/video.entity';
import type { IVideoServicePort } from '../domain/video.service.port';
import { PrismaVideoRepositoryAdapter } from '../infraestructure/prisma-video.repository.adapter';
import { CreateVideoDto } from './create-video.dto';

/**
 * Application Service / Use Case Handler para Videos.
 * Toda la lógica de negocio que no pertenece al dominio puro se coloca aquí.
 * No conoce detalles de la infraestructura (ORM, DB, almacenamiento, etc.).
 */
@Injectable()
export class VideoService implements IVideoServicePort {
  constructor(
    private readonly storage: StorageService,
    private readonly videoRepository: PrismaVideoRepositoryAdapter,
  ) {}

  /**
   * Registra un archivo de video subido y guarda sus metadatos en BD.
   */
  async registerUploadedFile(
    file: Express.Multer.File,
    dto: CreateVideoDto,
  ): Promise<VideoEntity> {
    const id = uuidv4();

    const storagePath = this.storage.getUploadPath(file.filename);
    const video = new VideoEntity({
      id,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      url: storagePath,
      title: dto.title,
    });

    // Guardar en BD (por ejemplo con Prisma)
    await this.videoRepository.create(video);

    return video;
  }

  /**
   * Obtiene un video por su ID.
   * @param id Identificador del video
   * @returns VideoEntity o null si no existe
   */
  async getVideoById(id: string): Promise<VideoEntity | null> {
    return this.videoRepository.findById(id);
  }

  /**
   * Obtiene todos los videos.
   * @returns Lista de VideoEntity
   */
  async getAllVideos(): Promise<VideoEntity[]> {
    return this.videoRepository.findAll();
  }
}
