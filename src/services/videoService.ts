/**
 * VideoService — wraps video storage operations
 */

import {
  saveVideo as dbSaveVideo,
  deleteVideo as dbDeleteVideo,
  videoExists as dbVideoExists,
  getVideoPath as dbGetVideoPath,
  getVideoMimeType as dbGetVideoMimeType,
  initVideoStorage,
} from '../storage/video.js';
import type { IVideoService } from './interfaces.js';

export class VideoService implements IVideoService {
  async save(id: string, buffer: Buffer, mimeType: string, subdomain?: string): Promise<string> {
    return dbSaveVideo(id, buffer, mimeType, subdomain);
  }

  async delete(path: string): Promise<void> {
    await dbDeleteVideo(path);
  }

  exists(path: string): boolean {
    return dbVideoExists(path);
  }

  // Resolve a stored relative video path (e.g. "sub/id.mp4") to its absolute
  // filesystem path. The argument is the value persisted in page.video, not a
  // bare id — passing an id would yield a wrong path.
  getPath(relativePath: string): string {
    return dbGetVideoPath(relativePath);
  }

  getMimeType(path: string): string | undefined {
    const mime = dbGetVideoMimeType(path);
    return mime || undefined;
  }
}