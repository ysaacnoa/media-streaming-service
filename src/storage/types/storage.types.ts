export interface IStorageService {
  getUploadsDir(): string;
  getUploadPath(filename: string): string;
  getMetaPath(id: string): string;
  getHlsPath(id: string): string;
  getHlsMasterPlaylist(id: string): string;
  ensureDirs(): Promise<void>;
}
