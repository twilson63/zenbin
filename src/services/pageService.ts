/**
 * PageService — wraps all page storage operations
 *
 * Routes should call this instead of importing from storage/db.ts directly.
 * Adds plan limit enforcement and usage tracking on top of raw DB ops.
 */

import {
  savePage as dbSavePage,
  getPage as dbGetPage,
  deletePage as dbDeletePage,
  getPageCount as dbGetPageCount,
  listPagesBySubdomain as dbListPagesBySubdomain,
  listPagesBySubdomainPaginated as dbListPagesBySubdomainPaginated,
  listPagesByOwner as dbListPagesByOwner,
  incrementAgentKeyUsage,
  decrementSubdomainPageCount as dbDecrementSubdomainPageCount,
  incrementSubdomainPageCount as dbIncrementSubdomainPageCount,
  getAgentKey,
} from '../storage/db.js';
import type { PageSummary } from '../storage/db.js';
import { deleteVideo, saveVideo } from '../storage/video.js';
import { checkPageLimit, getPlanFromKey, isBillingCycleExpired } from '../rules.js';
import { config } from '../config.js';
import { generateEtag } from '../utils/etag.js';
import { hashPassword, generateUrlToken } from '../utils/auth.js';
import type { Page, SaveResult, LimitCheckResult } from '../types.js';
import type { IPageService } from './interfaces.js';

export class PageService implements IPageService {
  async save(
    id: string,
    data: {
      html?: string;
      markdown?: string;
      image?: string;
      image_content_type?: string;
      video?: string;
      video_content_type?: string;
      encoding?: 'utf-8' | 'base64';
      content_type?: string;
      title?: string;
      subdomain?: string;
      auth?: { passwordHash?: string; urlTokenHash?: string };
      ownerKeyId?: string;
      publishSignature?: string;
      contentDigest?: string;
      publishTimestamp?: string;
      publishNonce?: string;
      publishMethod?: string;
      publishPath?: string;
      status?: 'active' | 'removed';
    },
    etag: string,
  ): Promise<SaveResult> {
    return dbSavePage(id, data, etag);
  }

  get(id: string, subdomain?: string): Page | undefined {
    return dbGetPage(id, subdomain);
  }

  async delete(id: string, subdomain?: string): Promise<boolean> {
    const page = dbGetPage(id, subdomain);
    if (page?.video) {
      await deleteVideo(page.video);
    }
    const deleted = await dbDeletePage(id, subdomain);
    if (deleted && subdomain) {
      dbDecrementSubdomainPageCount(subdomain);
    }
    return deleted;
  }

  count(): number {
    return dbGetPageCount();
  }

  listBySubdomain(subdomain: string): Page[] {
    return dbListPagesBySubdomain(subdomain);
  }

  /**
   * List pages in a subdomain with cursor-based pagination.
   * Returns metadata-only summaries (no HTML/Markdown/image/video content).
   */
  listBySubdomainPaginated(subdomain: string, cursor?: string, limit?: number): { pages: PageSummary[]; total: number; next_cursor: string | null } {
    return dbListPagesBySubdomainPaginated(subdomain, cursor, limit);
  }

  /**
   * Check if a page publish is allowed under the current plan.
   * Returns { allowed: true } or { allowed: false, reason: '...' }
   * Only checks for NEW pages — updates to existing pages are always allowed.
   */
  checkPublishLimit(keyId: string, id: string, subdomain?: string): LimitCheckResult {
    const existing = this.get(id, subdomain);
    if (existing) {
      // Updates are always allowed regardless of plan
      return { allowed: true };
    }

    const agentKey = getAgentKey(keyId);
    const plan = agentKey ? getPlanFromKey(agentKey) : 'free';
    return checkPageLimit(plan, agentKey?.monthlyPageCount || 0);
  }

  /**
   * Track page creation for billing purposes.
   * Call after a successful page creation.
   */
  trackPageCreation(keyId: string): void {
    incrementAgentKeyUsage(keyId, 'monthlyPageCount');
  }

  /**
   * Build the etag for a page based on its content.
   */
  buildEtag(parts: string[]): string {
    return generateEtag(parts.join(''));
  }

  /**
   * Hash a password for page auth.
   */
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  /**
   * Generate a URL token for page auth.
   */
  generateUrlToken(): { token: string; hash: string } {
    return generateUrlToken();
  }

  /**
   * Save a video file and return its path.
   */
  async saveVideoFile(id: string, buffer: Buffer, mimeType: string, subdomain?: string): Promise<string> {
    return saveVideo(id, buffer, mimeType, subdomain);
  }

  /**
   * Delete a video file.
   */
  async deleteVideoFile(path: string): Promise<void> {
    await deleteVideo(path);
  }

  /**
   * Increment subdomain page count.
   */
  incrementSubdomainPageCount(subdomain: string): void {
    dbIncrementSubdomainPageCount(subdomain);
  }

  /**
   * Decrement subdomain page count.
   */
  decrementSubdomainPageCount(subdomain: string): void {
    dbDecrementSubdomainPageCount(subdomain);
  }

  /**
   * List pages by owner key ID with cursor-based pagination.
   */
  listByOwner(keyId: string, cursor?: string, limit?: number): { pages: PageSummary[]; total: number; next_cursor: string | null } {
    return dbListPagesByOwner(keyId, cursor, limit);
  }
}