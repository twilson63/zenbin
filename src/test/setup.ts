import { beforeAll, afterAll } from 'vitest';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';

const TEST_DB_PATH = './data/test.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit'];

beforeAll(() => {
  // Clean up any existing test database
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
  }
  
  // Set test database path
  process.env.LMDB_PATH = TEST_DB_PATH;
  
  // Initialize database
  initDatabase();
});

afterAll(async () => {
  await closeDatabase();
  
  // Clean up test database
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});
