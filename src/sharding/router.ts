import { createHash } from 'crypto';

/**
 * ShardRouter - Content-addressed shard routing
 *
 * Uses SHA-256 content hashes to determine which shard stores data.
 * This provides:
 * - Deterministic routing (same content → same shard)
 * - Natural deduplication (identical content stored once)
 * - Even distribution across shards
 */
export class ShardRouter {
  private shards: string[];
  private hashLength: number;

  constructor(shards: string[], hashLength: number = 16) {
    if (shards.length === 0) {
      throw new Error('At least one shard is required');
    }
    this.shards = shards;
    this.hashLength = hashLength;
  }

  /**
   * Get the number of shards
   */
  getShardCount(): number {
    return this.shards.length;
  }

  /**
   * Get all shard names
   */
  getShards(): string[] {
    return [...this.shards];
  }

  /**
   * Hash content using SHA-256
   * Returns first N characters (default 16 = 64 bits)
   */
  contentHash(content: string): string {
    return createHash('sha256')
      .update(content)
      .digest('hex')
      .slice(0, this.hashLength);
  }

  /**
   * Route content to a shard by hashing
   */
  routeByContent(content: string): string {
    const hash = this.contentHash(content);
    return this.hashToShard(hash);
  }

  /**
   * Route by an existing hash (for lookups)
   */
  routeByHash(hash: string): string {
    return this.hashToShard(hash);
  }

  /**
   * Map a hash to a shard using modulo
   * Simple but effective for even distribution
   */
  private hashToShard(hash: string): string {
    const hashInt = BigInt('0x' + hash);
    const shardIndex = Number(hashInt % BigInt(this.shards.length));
    return this.shards[shardIndex];
  }

  /**
   * Check if content needs to move when shard count changes
   * Used during rebalancing operations
   */
  needsRebalance(
    contentHash: string,
    oldShardCount: number,
    newShardCount: number
  ): boolean {
    const hashInt = BigInt('0x' + contentHash);
    const oldIdx = Number(hashInt % BigInt(oldShardCount));
    const newIdx = Number(hashInt % BigInt(newShardCount));
    return oldIdx !== newIdx;
  }

  /**
   * Get the shard index (0-based) for a hash
   */
  getShardIndex(hash: string): number {
    const hashInt = BigInt('0x' + hash);
    return Number(hashInt % BigInt(this.shards.length));
  }

  /**
   * Add a new shard and return pages that need rebalancing
   * Note: This doesn't modify the router - caller should create new router
   */
  static computeRebalanceMapping(
    contentHashes: string[],
    oldShardCount: number,
    newShardCount: number
  ): Map<string, { oldShard: number; newShard: number }> {
    const moves = new Map<string, { oldShard: number; newShard: number }>();

    for (const hash of contentHashes) {
      const hashInt = BigInt('0x' + hash);
      const oldIdx = Number(hashInt % BigInt(oldShardCount));
      const newIdx = Number(hashInt % BigInt(newShardCount));

      if (oldIdx !== newIdx) {
        moves.set(hash, { oldShard: oldIdx, newShard: newIdx });
      }
    }

    return moves;
  }
}

/**
 * Default shard configuration
 * In production, this would come from config
 */
export function createDefaultShardRouter(shardCount: number = 1): ShardRouter {
  const shards = Array.from({ length: shardCount }, (_, i) => `shard-${i}`);
  return new ShardRouter(shards);
}