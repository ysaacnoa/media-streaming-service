import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IStorageService } from './types/storage.types';

@Injectable()
export class StorageService implements IStorageService {
  private base = 'storage';
  private uploads = path.join(this.base, 'uploads');
  private meta = path.join(this.base, 'meta');
  private hls = path.join(this.base, 'hls');

  /**
   * Normaliza un path a formato con `/` sin importar el SO
   */
  normalize(p: string): string {
    return p.replace(/\\/g, '/');
  }

  getUploadsDir(): string {
    return this.normalize(this.uploads);
  }

  getUploadPath(filename: string): string {
    return this.normalize(path.join(this.uploads, filename));
  }

  getMetaPath(id: string): string {
    return this.normalize(path.join(this.meta, `${id}.json`));
  }

  getHlsPath(id: string): string {
    return this.normalize(path.join(this.hls, id));
  }

  getHlsMasterPlaylist(id: string): string {
    return this.normalize(path.join(this.hls, id, 'master.m3u8'));
  }

  async ensureDirs(): Promise<void> {
    await fs.ensureDir(this.uploads);
    await fs.ensureDir(this.meta);
    await fs.ensureDir(this.hls);
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  async writeJson(filePath: string, data: any): Promise<void> {
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  async readJson<T = any>(filePath: string): Promise<T> {
    return fs.readJson(filePath);
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  async pathExists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }
}
