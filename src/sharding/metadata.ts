import { open, Database } from 'lmdb';
import { config } from '../config.js';

/**
 * PageMetadata - Lightweight index entry for routing
 *
 * This index lives on the gateway and maps page IDs to their shard location.
 * It enables fast lookups without needing to query all shards.
 */
export interface PageMetadata {
  id: string;              // Page ID
  shard: string;            // Which shard stores this page (e.g., "shard-0")
  contentHash: string;      // SHA-256 hash of content (first 16 chars)
  subdomain?: string;       // Optional subdomain ownership
  contentType: string;      // Content type for quick routing
  createdAt: number;        // Unix timestamp
  updatedAt: number;        // Unix timestamp
}

/**
 * SubdomainMetadata - Index entry for subdomain routing
 */
export interface SubdomainMetadata {
  name: string;
  primaryShard: string;     // Default shard for new pages in this subdomain
  pageCount: number;
  createdAt: number;
  updatedAt: number;
}

let metadataDb: Database<PageMetadata, string> | null = null;
let subdomainMetaDb: Database<SubdomainMetadata, string> | null = null;

/**
 * Initialize the metadata index database
 * Should be called on startup
 */
export function initMetadataIndex(): void {
  const indexPath = `${config.lmdbPath}-metadata`;

  metadataDb = open<PageMetadata, string>({
    path: indexPath,
    compression: true,
  });

  subdomainMetaDb = open<SubdomainMetadata, string>({
    path: `${indexPath}-subdomains`,
    compression: true,
  });

  console.log(`Metadata index initialized at ${indexPath}`);
}

/**
 * Get the metadata database
 */
export function getMetadataDb(): Database<PageMetadata, string> {
  if (!metadataDb) {
    throw new Error('Metadata index not initialized. Call initMetadataIndex() first.');
  }
  return metadataDb;
}

/**
 * Get the subdomain metadata database
 */
export function getSubdomainMetaDb(): Database<SubdomainMetadata, string> {
  if (!subdomainMetaDb) {
    throw new Error('Metadata index not initialized. Call initMetadataIndex() first.');
  }
  return subdomainMetaDb;
}

// =====================
// Page Metadata Operations
// =====================

/**
 * Store page metadata in the index
 */
export async function setPageMetadata(metadata: PageMetadata): Promise<void> {
  const db = getMetadataDb();
  const key = metadata.subdomain
    ? `${metadata.subdomain}:${metadata.id}`
    : metadata.id;
  await db.put(key, metadata);
}

/**
 * Get page metadata from the index
 */
export function getPageMetadata(id: string, subdomain?: string): PageMetadata | undefined {
  const db = getMetadataDb();
  const key = subdomain ? `${subdomain}:${id}` : id;
  return db.get(key);
}

/**
 * Delete page metadata from the index
 */
export async function deletePageMetadata(id: string, subdomain?: string): Promise<boolean> {
  const db = getMetadataDb();
  const key = subdomain ? `${subdomain}:${id}` : id;
  return db.remove(key);
}

/**
 * Check if page exists in metadata index
 */
export function pageMetadataExists(id: string, subdomain?: string): boolean {
  const db = getMetadataDb();
  const key = subdomain ? `${subdomain}:${id}` : id;
  return db.doesExist(key);
}

/**
 * List all metadata entries (for rebalancing)
 * Returns an async generator for memory efficiency
 */
export async function* scanAllMetadata(): AsyncGenerator<PageMetadata> {
  const db = getMetadataDb();
  for (const entry of db.getRange()) {
    yield entry.value;
  }
}

/**
 * Get total page count from metadata index
 */
export async function getMetadataPageCount(): Promise<number> {
  const db = getMetadataDb();
  return (await db.getKeys().asArray).length;
}

/**
 * List pages by subdomain from metadata index
 */
export function listMetadataBySubdomain(subdomain: string): PageMetadata[] {
  const db = getMetadataDb();
  const prefix = `${subdomain}:`;
  const pages: PageMetadata[] = [];

  for (const key of db.getKeys({ start: prefix })) {
    if (key.startsWith(prefix)) {
      const meta = db.get(key);
      if (meta) {
        pages.push(meta);
      }
    }
  }

  return pages;
}

// =====================
// Shard Statistics
// =====================

/**
 * Get statistics about shard distribution
 */
export function getShardDistribution(): Map<string, number> {
  const db = getMetadataDb();
  const distribution = new Map<string, number>();

  for (const entry of db.getRange()) {
    const shard = entry.value.shard;
    distribution.set(shard, (distribution.get(shard) || 0) + 1);
  }

  return distribution;
}

// =====================
// Subdomain Metadata Operations
// =====================

/**
 * Store subdomain metadata
 */
export async function setSubdomainMetadata(metadata: SubdomainMetadata): Promise<void> {
  const db = getSubdomainMetaDb();
  await db.put(metadata.name, metadata);
}

/**
 * Get subdomain metadata
 */
export function getSubdomainMetadata(name: string): SubdomainMetadata | undefined {
  const db = getSubdomainMetaDb();
  return db.get(name);
}

/**
 * Delete subdomain metadata
 */
export async function deleteSubdomainMetadata(name: string): Promise<boolean> {
  const db = getSubdomainMetaDb();
  return db.remove(name);
}

/**
 * Increment subdomain page count
 */
export function incrementSubdomainMetaPageCount(name: string, shard: string): void {
  const db = getSubdomainMetaDb();
  const meta = db.get(name);

  if (meta) {
    meta.pageCount += 1;
    meta.updatedAt = Date.now();
    db.putSync(name, meta);
  } else {
    // Create new subdomain metadata
    const now = Date.now();
    db.putSync(name, {
      name,
      primaryShard: shard,
      pageCount: 1,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Decrement subdomain page count
 */
export function decrementSubdomainMetaPageCount(name: string): void {
  const db = getSubdomainMetaDb();
  const meta = db.get(name);

  if (meta && meta.pageCount > 0) {
    meta.pageCount -= 1;
    meta.updatedAt = Date.now();
    db.putSync(name, meta);
  }
}

/**
 * Close metadata databases
 */
export async function closeMetadataIndex(): Promise<void> {
  if (metadataDb) {
    await metadataDb.close();
    metadataDb = null;
  }
  if (subdomainMetaDb) {
    await subdomainMetaDb.close();
    subdomainMetaDb = null;
  }
}