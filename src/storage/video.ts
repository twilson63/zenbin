import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { config } from '../config.js';

/**
 * Video storage module
 * 
 * Videos are stored on the filesystem with a reference in LMDB.
 * File naming: {videoStoragePath}/{subdomain}/{id}.{ext}
 * - For subdomain pages: {videoStoragePath}/{subdomain}/{id}.{ext}
 * - For regular pages: {videoStoragePath}/{id}.{ext}
 */

/**
 * Ensure the video storage directory exists
 */
export function initVideoStorage(): void {
  if (!fs.existsSync(config.videoStoragePath)) {
    fs.mkdirSync(config.videoStoragePath, { recursive: true });
  }
}

/**
 * Get the file extension for a content type
 */
function getExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
  };
  return extensions[contentType] || 'mp4';
}

/**
 * Generate a unique filename for a video
 */
function generateFilename(subdomain: string | undefined, id: string, contentType: string): string {
  const ext = getExtension(contentType);
  if (subdomain) {
    return path.join(config.videoStoragePath, subdomain, `${id}.${ext}`);
  }
  return path.join(config.videoStoragePath, `${id}.${ext}`);
}

/**
 * Save a video to persistent storage
 * Returns the relative path to the video file
 */
export async function saveVideo(
  id: string,
  videoData: Buffer,
  contentType: string,
  subdomain?: string
): Promise<string> {
  // Ensure directory exists
  if (subdomain) {
    const subdir = path.join(config.videoStoragePath, subdomain);
    if (!fs.existsSync(subdir)) {
      fs.mkdirSync(subdir, { recursive: true });
    }
  } else {
    initVideoStorage();
  }

  // Generate filename
  const filename = generateFilename(subdomain, id, contentType);
  
  // Write video to disk
  await fs.promises.writeFile(filename, videoData);
  
  // Return relative path (for storage in LMDB)
  if (subdomain) {
    return `${subdomain}/${id}.${getExtension(contentType)}`;
  }
  return `${id}.${getExtension(contentType)}`;
}

/**
 * Get the full path to a video file
 */
export function getVideoPath(relativePath: string): string {
  return path.join(config.videoStoragePath, relativePath);
}

/**
 * Check if a video file exists
 */
export function videoExists(relativePath: string): boolean {
  const fullPath = getVideoPath(relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Get video file stats (size, etc.)
 */
export async function getVideoStats(relativePath: string): Promise<fs.Stats | null> {
  const fullPath = getVideoPath(relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.promises.stat(fullPath);
}

/**
 * Delete a video file
 */
export async function deleteVideo(relativePath: string): Promise<boolean> {
  const fullPath = getVideoPath(relativePath);
  if (fs.existsSync(fullPath)) {
    await fs.promises.unlink(fullPath);
    return true;
  }
  return false;
}

/**
 * Create a read stream for a video file (for Range requests)
 */
export function createVideoStream(relativePath: string, options?: { start?: number; end?: number }): fs.ReadStream | null {
  const fullPath = getVideoPath(relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  if (options?.start !== undefined && options?.end !== undefined) {
    return fs.createReadStream(fullPath, { start: options.start, end: options.end });
  }
  
  return fs.createReadStream(fullPath);
}

/**
 * Get MIME type from file extension
 */
export function getVideoMimeType(relativePath: string): string {
  const ext = path.extname(relativePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogv': 'video/ogg',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
  };
  return mimeTypes[ext] || 'video/mp4';
}