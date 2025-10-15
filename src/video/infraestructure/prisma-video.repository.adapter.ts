import { Injectable } from '@nestjs/common';
import { PrismaAdapter } from 'src/database/prisma.adapter';
import { VideoRepositoryPort } from 'src/video/domain/video.repository.port';
import { VideoEntity } from '../domain/video.entity';
import { Video } from '@prisma/client';

/**
 * Adapter que implementa el VideoRepositoryPort usando Prisma.
 * Convierte automáticamente los registros de Prisma en VideoEntity,
 * manteniendo la capa de dominio desacoplada del ORM.
 */
@Injectable()
export class PrismaVideoRepositoryAdapter implements VideoRepositoryPort {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Crea un nuevo video en la base de datos.
   * @param video Entidad VideoEntity con los datos a persistir
   * @returns VideoEntity creado
   */
  async create(video: VideoEntity): Promise<VideoEntity> {
    const response = await this.prisma.video.create({ data: { ...video } });
    return this.toEntity(response);
  }

  /**
   * Busca un video por su ID.
   * @param id Identificador del video
   * @returns VideoEntity o null si no existe
   */
  async findById(id: string): Promise<VideoEntity | null> {
    const response = await this.prisma.video.findUnique({ where: { id } });
    return response ? this.toEntity(response) : null;
  }

  /**
   * Devuelve todos los videos.
   * @returns Lista de VideoEntity
   */
  async findAll(): Promise<VideoEntity[]> {
    const response = await this.prisma.video.findMany();
    return response.map((record) => this.toEntity(record));
  }

  /**
   * Convierte un registro Prisma a VideoEntity.
   * Usa tipos generados automáticamente (`Video`) para seguridad de tipos.
   */
  private toEntity(record: Video): VideoEntity {
    return new VideoEntity({
      id: record.id,
      originalName: record.originalName,
      filename: record.filename,
      size: record.size,
      mimeType: record.mimeType,
      url: record.url,
      status: record.status,
      title: record.title,
      createdAt: record.createdAt,
    });
  }
}
