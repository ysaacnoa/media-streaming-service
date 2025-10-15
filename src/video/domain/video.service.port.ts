import { CreateVideoDto } from '../application/create-video.dto';
import { VideoEntity } from './video.entity';

/**
 * IVideoServicePort define los casos de uso públicos que
 * la capa de aplicación expone para trabajar con videos.
 *
 * Esta interfaz desacopla el servicio de la infraestructura,
 * permitiendo que el controller o cualquier otro cliente
 * dependa solo de la abstracción.
 */
export interface IVideoServicePort {
  /**
   * Crea un nuevo video en el sistema.
   * @param dto Data transfer object con información del video
   * @returns La entidad VideoEntity creada
   */
  registerUploadedFile(
    file: Express.Multer.File,
    dto: CreateVideoDto,
  ): Promise<VideoEntity>;

  /**
   * Obtiene un video por su ID.
   * @param id Identificador único del video
   * @returns VideoEntity o null si no existe
   */
  getVideoById(id: string): Promise<VideoEntity | null>;

  /**
   * Obtiene todos los videos existentes.
   * @returns Lista de VideoEntity
   */
  getAllVideos(): Promise<VideoEntity[]>;
}
