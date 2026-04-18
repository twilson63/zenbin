import { open, Database } from 'lmdb';
import { config } from '../config.js';
import { Page, PageAuth } from '../storage/db.js';

/**
 * Shard - A single LMDB instance for content-addressed storage
 *
 * Each shard is a separate LMDB database that stores pages keyed by their
 * content hash. This enables natural deduplication within a shard.
 */
export class Shard {
  private db: Database<Page, string>;
  private name: string;
  private path: string;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
    this.db = open<Page, string>({
      path,
      compression: true,
    });
  }

  /**
   * Get shard name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get shard path
   */
  getPath(): string {
    return this.path;
  }

  /**
   * Store a page by content hash
   * Returns the page and whether it was created (vs updated)
   */
  async storePage(
    contentHash: string,
    data: {
      id: string;
      subdomain?: string;
      html: string;
      markdown?: string;
      image?: string;
      video?: string;
      encoding?: 'utf-8' | 'base64';
      content_type?: string;
      title?: string;
      auth?: PageAuth;
    }
  ): Promise<{ page: Page; created: boolean }> {
    // Key by content hash for deduplication
    // Include subdomain prefix for namespacing
    const key = data.subdomain
      ? `${data.subdomain}:${contentHash}`
      : contentHash;

    const existing = this.db.get(key);
    const now = new Date().toISOString();

    const page: Page = {
      id: data.id,
      subdomain: data.subdomain,
      html: data.html,
      markdown: data.markdown,
      image: data.image,
      video: data.video,
      encoding: data.encoding || 'utf-8',
      content_type: data.content_type || 'text/html; charset=utf-8',
      title: data.title,
      etag: contentHash, // Content hash is the etag
      created_at: existing?.created_at || now,
      updated_at: now,
      auth: data.auth,
    };

    await this.db.put(key, page);

    return {
      page,
      created: !existing,
    };
  }

  /**
   * Get a page by content hash
   */
  getPage(contentHash: string, subdomain?: string): Page | undefined {
    const key = subdomain ? `${subdomain}:${contentHash}` : contentHash;
    return this.db.get(key);
  }

  /**
   * Check if content exists (for deduplication)
   */
  hasContent(contentHash: string, subdomain?: string): boolean {
    const key = subdomain ? `${subdomain}:${contentHash}` : contentHash;
    return this.db.doesExist(key);
  }

  /**
   * Delete a page by content hash
   */
  async deletePage(contentHash: string, subdomain?: string): Promise<boolean> {
    const key = subdomain ? `${subdomain}:${contentHash}` : contentHash;
    return this.db.remove(key);
  }

  /**
   * Get page count in this shard
   */
  async getPageCount(): Promise<number> {
    return (await this.db.getKeys().asArray).length;
  }

  /**
   * List pages by subdomain in this shard
   */
  listPagesBySubdomain(subdomain: string): Page[] {
    const prefix = `${subdomain}:`;
    const pages: Page[] = [];

    for (const key of this.db.getKeys({ start: prefix })) {
      if (key.startsWith(prefix)) {
        const page = this.db.get(key);
        if (page) {
          pages.push(page);
        }
      }
    }

    return pages;
  }

  /**
   * Stream all pages (for rebalancing)
   */
  async *scanPages(): AsyncGenerator<{ key: string; page: Page }> {
    for (const entry of this.db.getRange()) {
      yield { key: entry.key, page: entry.value };
    }
  }

  /**
   * Close the shard database
   */
  async close(): Promise<void> {
    await this.db.close();
  }

  /**
   * Get raw LMDB instance (for advanced operations)
   */
  getDb(): Database<Page, string> {
    return this.db;
  }
}

/**
 * ShardManager - Manages multiple shards
 */
export class ShardManager {
  private shards: Map<string, Shard> = new Map();
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || config.lmdbPath;
  }

  /**
   * Initialize shards
   */
  init(shardNames: string[]): void {
    for (const name of shardNames) {
      const path = `${this.basePath}-${name}`;
      this.shards.set(name, new Shard(name, path));
    }
  }

  /**
   * Get a shard by name
   */
  getShard(name: string): Shard | undefined {
    return this.shards.get(name);
  }

  /**
   * Get all shard names
   */
  getShardNames(): string[] {
    return Array.from(this.shards.keys());
  }

  /**
   * Get shard count
   */
  getShardCount(): number {
    return this.shards.size;
  }

  /**
   * Get total page count across all shards
   */
  async getTotalPageCount(): Promise<number> {
    let total = 0;
    for (const shard of this.shards.values()) {
      total += await shard.getPageCount();
    }
    return total;
  }

  /**
   * Get distribution of pages across shards
   */
  async getDistribution(): Promise<Map<string, number>> {
    const distribution = new Map<string, number>();
    for (const [name, shard] of this.shards) {
      distribution.set(name, await shard.getPageCount());
    }
    return distribution;
  }

  /**
   * Close all shards
   */
  async closeAll(): Promise<void> {
    for (const shard of this.shards.values()) {
      await shard.close();
    }
    this.shards.clear();
  }
}

/**
 * Create a single-shard manager for backwards compatibility
 */
export function createSingleShardManager(): ShardManager {
  const manager = new ShardManager();
  manager.init(['shard-0']);
  return manager;
}