import { open, Database } from 'lmdb';
import { config } from '../config.js';

// Page authentication data
export interface PageAuth {
  passwordHash?: string;   // bcrypt hash
  urlTokenHash?: string;   // SHA-256 hash (hex)
}

// Page data model
export interface Page {
  id: string;
  subdomain?: string;      // which subdomain owns this page
  html: string;
  markdown?: string;
  image?: string;           // Base64-encoded image data
  video?: string;          // Path to video file on disk (relative to videoStoragePath)
  encoding: 'utf-8' | 'base64';
  content_type: string;
  title?: string;
  etag: string;
  created_at: string;
  updated_at: string;
  auth?: PageAuth;         // Optional - undefined means public page
}

// Subdomain data model
export interface Subdomain {
  name: string;
  created_at: string;
  updated_at: string;
  page_count: number;
}

// Result type for save operations
export interface SaveResult {
  page: Page;
  created: boolean;
}

// Result type for subdomain operations
export interface SubdomainResult {
  subdomain: Subdomain;
  created: boolean;
}

let db: Database<Page, string>;
let subdomainDb: Database<Subdomain, string>;

export function initDatabase(): { pages: Database<Page, string>; subdomains: Database<Subdomain, string> } {
  if (!db) {
    db = open<Page, string>({
      path: config.lmdbPath,
      compression: true,
    });
  }
  if (!subdomainDb) {
    subdomainDb = open<Subdomain, string>({
      path: `${config.lmdbPath}-subdomains`,
      compression: true,
    });
  }
  return { pages: db, subdomains: subdomainDb };
}

export function getDatabase(): Database<Page, string> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function getSubdomainDatabase(): Database<Subdomain, string> {
  if (!subdomainDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return subdomainDb;
}

// =====================
// Page Operations
// =====================

export async function savePage(
  id: string,
  data: {
    html?: string;
    markdown?: string;
    image?: string;
    video?: string;           // Path to video file on disk (relative)
    encoding?: 'utf-8' | 'base64';
    content_type?: string;
    title?: string;
    subdomain?: string;
    auth?: { passwordHash?: string; urlTokenHash?: string };
  },
  etag: string
): Promise<SaveResult> {
  const db = getDatabase();
  
  // For subdomain pages, use composite key; for regular pages, use id directly
  const key = data.subdomain ? `${data.subdomain}:${id}` : id;
  const existing = db.get(key);
  const now = new Date().toISOString();

  const page: Page = {
    id,
    subdomain: data.subdomain,
    html: data.html || '',
    markdown: data.markdown,
    image: data.image,
    video: data.video,
    encoding: data.encoding || 'utf-8',
    content_type: data.content_type || 'text/html; charset=utf-8',
    title: data.title,
    etag,
    created_at: existing?.created_at || now,
    updated_at: now,
    auth: data.auth,
  };

  await db.put(key, page);

  return {
    page,
    created: !existing,
  };
}

export function getPage(id: string, subdomain?: string): Page | undefined {
  const db = getDatabase();
  const key = subdomain ? `${subdomain}:${id}` : id;
  return db.get(key);
}

export async function deletePage(id: string, subdomain?: string): Promise<boolean> {
  const db = getDatabase();
  const key = subdomain ? `${subdomain}:${id}` : id;
  const existing = db.get(key);
  if (!existing) {
    return false;
  }
  await db.remove(key);
  return true;
}

export async function getPageCount(): Promise<number> {
  const db = getDatabase();
  return (await db.getKeys().asArray).length;
}

export function listPagesBySubdomain(subdomain: string): Page[] {
  const db = getDatabase();
  const prefix = `${subdomain}:`;
  const pages: Page[] = [];
  
  for (const key of db.getKeys({ start: prefix })) {
    if (key.startsWith(prefix)) {
      const page = db.get(key);
      if (page) {
        pages.push(page);
      }
    }
  }
  
  return pages;
}

// =====================
// Subdomain Operations
// =====================

export async function saveSubdomain(name: string): Promise<SubdomainResult> {
  const subdomainDb = getSubdomainDatabase();
  const existing = subdomainDb.get(name);
  const now = new Date().toISOString();

  const subdomain: Subdomain = {
    name,
    created_at: existing?.created_at || now,
    updated_at: now,
    page_count: existing?.page_count || 0,
  };

  await subdomainDb.put(name, subdomain);

  return {
    subdomain,
    created: !existing,
  };
}

export function getSubdomain(name: string): Subdomain | undefined {
  const subdomainDb = getSubdomainDatabase();
  return subdomainDb.get(name);
}

export async function deleteSubdomain(name: string): Promise<boolean> {
  const subdomainDb = getSubdomainDatabase();
  const db = getDatabase();
  
  const existing = subdomainDb.get(name);
  if (!existing) {
    return false;
  }
  
  // Delete all pages in this subdomain
  const prefix = `${name}:`;
  for (const key of db.getKeys({ start: prefix })) {
    if (key.startsWith(prefix)) {
      await db.remove(key);
    }
  }
  
  // Delete the subdomain
  await subdomainDb.remove(name);
  return true;
}

export async function getSubdomainCount(): Promise<number> {
  const subdomainDb = getSubdomainDatabase();
  return (await subdomainDb.getKeys().asArray).length;
}

export function incrementSubdomainPageCount(name: string): void {
  const subdomainDb = getSubdomainDatabase();
  const subdomain = subdomainDb.get(name);
  if (subdomain) {
    subdomain.page_count += 1;
    subdomain.updated_at = new Date().toISOString();
    subdomainDb.putSync(name, subdomain);
  }
}

export function decrementSubdomainPageCount(name: string): void {
  const subdomainDb = getSubdomainDatabase();
  const subdomain = subdomainDb.get(name);
  if (subdomain && subdomain.page_count > 0) {
    subdomain.page_count -= 1;
    subdomain.updated_at = new Date().toISOString();
    subdomainDb.putSync(name, subdomain);
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
  }
  if (subdomainDb) {
    await subdomainDb.close();
  }
}