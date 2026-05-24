import { Hono } from 'hono';
import type { Services } from '../services/container.js';

const stats = new Hono();

function getServices(c: any): Services {
  return c.get('services')!;
}

// GET /v1/stats - Get site statistics
stats.get('/', async (c) => {
  const services = getServices(c);
  const pageCount = services.pages.count();
  const subdomainCount = services.subdomains.count();
  const agentCount = services.keys.count('active');

  return c.json({
    pages: pageCount,
    subdomains: subdomainCount,
    agents: agentCount,
  });
});

export { stats };