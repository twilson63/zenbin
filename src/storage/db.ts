import { open, Database } from 'lmdb';
import { config } from '../config.js';

// Page data model
export interface Page {
  id: string;
  html: string;
  encoding: 'utf-8' | 'base64';
  content_type: string;
  title?: string;
  etag: string;
  created_at: string;
  updated_at: string;
}

// Result type for save operations
export interface SaveResult {
  page: Page;
  created: boolean;
}

let db: Database<Page, string>;

export function initDatabase(): Database<Page, string> {
  if (!db) {
    db = open<Page, string>({
      path: config.lmdbPath,
      compression: true,
    });
  }
  return db;
}

export function getDatabase(): Database<Page, string> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function savePage(
  id: string,
  data: {
    html: string;
    encoding?: 'utf-8' | 'base64';
    content_type?: string;
    title?: string;
  },
  etag: string
): Promise<SaveResult> {
  const db = getDatabase();
  const existing = db.get(id);
  const now = new Date().toISOString();

  const page: Page = {
    id,
    html: data.html,
    encoding: data.encoding || 'utf-8',
    content_type: data.content_type || 'text/html; charset=utf-8',
    title: data.title,
    etag,
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  await db.put(id, page);

  return {
    page,
    created: !existing,
  };
}

export function getPage(id: string): Page | undefined {
  const db = getDatabase();
  return db.get(id);
}

export async function deletePage(id: string): Promise<boolean> {
  const db = getDatabase();
  const existing = db.get(id);
  if (!existing) {
    return false;
  }
  await db.remove(id);
  return true;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
  }
}
