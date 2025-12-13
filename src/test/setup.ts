import { beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';

const TEST_DB_PATH = './data/test.lmdb';

beforeAll(() => {
  // Clean up any existing test database
  try {
    rmSync(TEST_DB_PATH, { recursive: true, force: true });
  } catch {
    // Ignore if doesn't exist
  }
  
  // Set test database path
  process.env.LMDB_PATH = TEST_DB_PATH;
  
  // Initialize database
  initDatabase();
});

afterAll(async () => {
  await closeDatabase();
  
  // Clean up test database
  try {
    rmSync(TEST_DB_PATH, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});
