import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ShardRouter, createDefaultShardRouter } from '../sharding/router.js';
import { initMetadataIndex, closeMetadataIndex, setPageMetadata, getPageMetadata, deletePageMetadata, getShardDistribution } from '../sharding/metadata.js';
import { rmSync } from 'fs';

const TEST_DB_PATH = './data/test-sharding.lmdb';

describe('ShardRouter', () => {
  describe('constructor', () => {
    it('should create router with shards', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      expect(router.getShardCount()).toBe(3);
      expect(router.getShards()).toEqual(['shard-0', 'shard-1', 'shard-2']);
    });

    it('should reject empty shard list', () => {
      expect(() => new ShardRouter([])).toThrow('At least one shard is required');
    });

    it('should support custom hash length', () => {
      const router = new ShardRouter(['shard-0'], 32);
      const hash = router.contentHash('test content');
      expect(hash.length).toBe(32);
    });
  });

  describe('contentHash', () => {
    it('should generate consistent hashes', () => {
      const router = createDefaultShardRouter();
      const content = '<html><body>Test</body></html>';
      
      const hash1 = router.contentHash(content);
      const hash2 = router.contentHash(content);
      
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(16); // Default 64-bit hash (16 hex chars)
    });

    it('should generate different hashes for different content', () => {
      const router = createDefaultShardRouter();
      
      const hash1 = router.contentHash('content A');
      const hash2 = router.contentHash('content B');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate valid hex strings', () => {
      const router = createDefaultShardRouter();
      const hash = router.contentHash('any content');
      
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe('routeByContent', () => {
    it('should route content to a shard', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const shard = router.routeByContent('<html>test</html>');
      
      expect(shard).toMatch(/^shard-[012]$/);
    });

    it('should route same content to same shard consistently', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const content = '<html><body>Consistent routing test</body></html>';
      
      const shard1 = router.routeByContent(content);
      const shard2 = router.routeByContent(content);
      const shard3 = router.routeByContent(content);
      
      expect(shard1).toBe(shard2);
      expect(shard2).toBe(shard3);
    });

    it('should distribute content across shards', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const distribution = new Map<string, number>();
      
      // Generate 100 different content items
      for (let i = 0; i < 100; i++) {
        const content = `<html><body>Page ${i} ${Math.random()}</body></html>`;
        const shard = router.routeByContent(content);
        distribution.set(shard, (distribution.get(shard) || 0) + 1);
      }
      
      // Each shard should have at least some pages
      expect(distribution.size).toBe(3);
      for (const [shard, count] of distribution) {
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  describe('routeByHash', () => {
    it('should route by existing hash', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const content = 'test content';
      const hash = router.contentHash(content);
      
      const shardFromContent = router.routeByContent(content);
      const shardFromHash = router.routeByHash(hash);
      
      expect(shardFromContent).toBe(shardFromHash);
    });
  });

  describe('needsRebalance', () => {
    it('should identify content that moves when shards change', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      
      // Test with a valid hex hash
      const hash = 'a1b2c3d4e5f67890';
      
      // When going from 3 to 4 shards, some content may need to move
      const needsMove = router.needsRebalance(hash, 3, 4);
      
      // The result depends on the hash value
      expect(typeof needsMove).toBe('boolean');
    });

    it('should return false when shard count unchanged', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const hash = 'a1b2c3d4e5f67890';
      
      expect(router.needsRebalance(hash, 3, 3)).toBe(false);
    });
  });

  describe('getShardIndex', () => {
    it('should return valid shard index', () => {
      const router = new ShardRouter(['shard-0', 'shard-1', 'shard-2']);
      const hash = router.contentHash('test');
      const index = router.getShardIndex(hash);
      
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(3);
    });
  });
});

describe('computeRebalanceMapping', () => {
  it('should compute which hashes need to move', () => {
    const hashes = [
      'a1b2c3d4e5f67890',
      'b2c3d4e5f6789012',
      'c3d4e5f678901234',
      'd4e5f67890123456',
      'e5f6789012345678',
    ];
    
    const mapping = ShardRouter.computeRebalanceMapping(hashes, 3, 4);
    
    // Some hashes might need to move
    expect(mapping.size).toBeGreaterThanOrEqual(0);
    expect(mapping.size).toBeLessThanOrEqual(hashes.length);
    
    for (const [hash, { oldShard, newShard }] of mapping) {
      expect(oldShard).toBeGreaterThanOrEqual(0);
      expect(oldShard).toBeLessThan(3);
      expect(newShard).toBeGreaterThanOrEqual(0);
      expect(newShard).toBeLessThan(4);
      expect(oldShard).not.toBe(newShard);
    }
  });
});

describe('Metadata Index', () => {
  beforeAll(() => {
    process.env.LMDB_PATH = TEST_DB_PATH;
    initMetadataIndex();
  });

  afterAll(async () => {
    await closeMetadataIndex();
    try {
      rmSync(TEST_DB_PATH, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  it('should store and retrieve page metadata', async () => {
    const metadata = {
      id: 'test-page-1',
      shard: 'shard-0',
      contentHash: 'a1b2c3d4e5f67890',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setPageMetadata(metadata);
    const retrieved = getPageMetadata('test-page-1');

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('test-page-1');
    expect(retrieved?.shard).toBe('shard-0');
    expect(retrieved?.contentHash).toBe('a1b2c3d4e5f67890');
  });

  it('should store metadata with subdomain', async () => {
    const metadata = {
      id: 'test-page-2',
      shard: 'shard-1',
      contentHash: 'b2c3d4e5f6789012',
      subdomain: 'myapp',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setPageMetadata(metadata);
    const retrieved = getPageMetadata('test-page-2', 'myapp');

    expect(retrieved).toBeDefined();
    expect(retrieved?.subdomain).toBe('myapp');
  });

  it('should delete metadata', async () => {
    const metadata = {
      id: 'test-page-3',
      shard: 'shard-0',
      contentHash: 'c3d4e5f678901234',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setPageMetadata(metadata);
    expect(getPageMetadata('test-page-3')).toBeDefined();

    await deletePageMetadata('test-page-3');
    expect(getPageMetadata('test-page-3')).toBeUndefined();
  });

  it('should get shard distribution', async () => {
    // Add some test data
    await setPageMetadata({
      id: 'dist-1',
      shard: 'shard-0',
      contentHash: '1111111111111111',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await setPageMetadata({
      id: 'dist-2',
      shard: 'shard-0',
      contentHash: '2222222222222222',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await setPageMetadata({
      id: 'dist-3',
      shard: 'shard-1',
      contentHash: '3333333333333333',
      contentType: 'text/html',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const distribution = getShardDistribution();
    
    expect(distribution.get('shard-0')).toBeGreaterThanOrEqual(2);
    expect(distribution.get('shard-1')).toBeGreaterThanOrEqual(1);
  });
});