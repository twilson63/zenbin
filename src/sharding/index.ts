/**
 * Sharding Module - Content-addressed storage with horizontal scaling
 *
 * Architecture:
 * - ShardRouter: Routes content to shards using consistent hashing
 * - MetadataIndex: Lightweight index mapping page IDs to shard locations
 * - Shard/ShardManager: Individual LMDB instances per shard
 *
 * Benefits:
 * - Deterministic routing (same content → same shard)
 * - Natural deduplication (content-addressed keys)
 * - Horizontal scaling (add shards without rebalancing all data)
 * - Fast lookups via metadata index
 *
 * Usage:
 * ```typescript
 * import { ShardRouter, ShardManager, initMetadataIndex } from './sharding';
 *
 * // Initialize
 * const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
 * const shardManager = new ShardManager();
 * shardManager.init(['shard-0', 'shard-1', 'shard-2']);
 * initMetadataIndex();
 *
 * // Create page
 * const contentHash = router.contentHash(html);
 * const shardName = router.routeByContent(html);
 * const shard = shardManager.getShard(shardName);
 * await shard.storePage(contentHash, pageData);
 *
 * // Read page
 * const meta = getPageMetadata(pageId);
 * const shard = shardManager.getShard(meta.shard);
 * const page = shard.getPage(meta.contentHash);
 * ```
 */

export { ShardRouter, createDefaultShardRouter } from './router.js';
export { Shard, ShardManager, createSingleShardManager } from './shard.js';
export {
  PageMetadata,
  SubdomainMetadata,
  initMetadataIndex,
  getMetadataDb,
  getSubdomainMetaDb,
  setPageMetadata,
  getPageMetadata,
  deletePageMetadata,
  pageMetadataExists,
  scanAllMetadata,
  getMetadataPageCount,
  listMetadataBySubdomain,
  getShardDistribution,
  setSubdomainMetadata,
  getSubdomainMetadata,
  deleteSubdomainMetadata,
  incrementSubdomainMetaPageCount,
  decrementSubdomainMetaPageCount,
  closeMetadataIndex,
} from './metadata.js';