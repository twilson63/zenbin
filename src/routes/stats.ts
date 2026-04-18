import { Hono } from 'hono';
import { getPageCount, getSubdomainCount } from '../storage/db.js';

const stats = new Hono();

// GET /v1/stats - Get site statistics
stats.get('/', async (c) => {
  const pageCount = await getPageCount();
  const subdomainCount = await getSubdomainCount();
  
  return c.json({
    pages: pageCount,
    subdomains: subdomainCount,
  });
});

export { stats };