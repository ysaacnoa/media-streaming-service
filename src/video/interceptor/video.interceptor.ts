import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';
import { MulterAdapter } from '../helpers/multer-adapter';

/**
 * Interceptor responsible for handling video file uploads using Multer,
 * while integrating custom storage logic via the {@link StorageService}.
 *
 * This class acts as a wrapper around NestJS's built-in {@link FileInterceptor},
 * allowing dynamic configuration through the {@link MulterAdapter}.
 *
 * ## Execution Flow
 * 1. When a `multipart/form-data` request is received with a `file` field,
 *    NestJS executes this interceptor before reaching the controller method.
 * 2. Inside the constructor, this interceptor creates an internal
 *    `FileInterceptor` instance configured with options provided by
 *    `MulterAdapter.videoUploadOptions(this.storage)`.
 * 3. The {@link intercept} method simply delegates the request handling to
 *    the internal `FileInterceptor`, which processes the upload and
 *    attaches the resulting file to the request object.
 *
 * ## Example
 * ```ts
 * @Post('upload')
 * @UseInterceptors(VideoUploadInterceptor)
 * async uploadVideo(@UploadedFile() file: Express.Multer.File) {
 *   console.log(file.filename); // => processed filename
 * }
 * ```
 *
 * @see FileInterceptor
 * @see MulterAdapter
 * @see StorageService
 */
@Injectable()
export class VideoUploadInterceptor implements NestInterceptor {
  /**
   * Internal delegate interceptor wrapping NestJS's FileInterceptor.
   * Created dynamically during construction.
   */
  private delegate: NestInterceptor;

  /**
   * Creates a new instance of the VideoUploadInterceptor.
   *
   * @param storage The {@link StorageService} instance used to provide
   *                upload paths, manage directories, and write metadata.
   *                Automatically injected by NestJS's dependency
   *                injection container when {@link StorageModule} is imported.
   */
  constructor(private readonly storage: StorageService) {
    this.delegate = new (FileInterceptor(
      'file',
      MulterAdapter.videoUploadOptions(this.storage),
    ))();
  }

  /**
   * Intercepts the incoming HTTP request and delegates file handling
   * to the internally created {@link FileInterceptor}.
   *
   * @param context The NestJS execution context, providing access to the request and response.
   * @param next The next handler in the request pipeline.
   * @returns An Observable representing the asynchronous flow of the next handler.
   */
  intercept(context: ExecutionContext, next: CallHandler) {
    return this.delegate.intercept(context, next);
  }
}
