/**
 * CAP-Tree v0.3 tree read endpoints + reviews query (PRD § 5.4 / § 5.6).
 *
 * All endpoints are unauthenticated (HB § 2.1 — reads are open) and return full
 * envelopes / ObjectRefs so every hop is client-verifiable.
 */
import { Context, Hono } from 'hono';
import { ErrorCodes, errorResponse } from '../errors.js';
import { HASH_RE } from 'cap-tree-core';
import type { Services } from '../services/container.js';

const trees = new Hono();
const reviews = new Hono();

function getServices(c: Context): Services {
  return c.get('services')!;
}
function parseLimit(c: Context, def: number, max: number): number {
  return Math.min(Math.max(parseInt(c.req.query('limit') || String(def), 10) || def, 1), max);
}

// GET /v1/trees/:treeId  and  /:treeId/refs — current refs envelope.
function currentRefsHandler(c: Context) {
  const treeId = c.req.param('treeId') ?? '';
  if (!HASH_RE.test(treeId)) return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  const services = getServices(c);
  if (!services.objects.treeExists(treeId)) return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  const refs = services.objects.currentRefs(treeId);
  if (!refs) return errorResponse(ErrorCodes.REFS_NOT_FOUND, 'No refs published for this tree', 404);
  return c.json(refs);
}

trees.get('/:treeId/refs/history', (c) => {
  const treeId = c.req.param('treeId') ?? '';
  if (!HASH_RE.test(treeId)) return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  const services = getServices(c);
  if (!services.objects.treeExists(treeId)) return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  const sinceParam = c.req.query('since');
  const before = sinceParam !== undefined ? parseInt(sinceParam, 10) : undefined;
  const limit = parseLimit(c, 20, 100);
  const { entries, next_cursor } = services.objects.refsHistory(treeId, before, limit);
  return c.json({ refs: entries, next_cursor });
});

trees.get('/:treeId/refs', currentRefsHandler);

trees.get('/:treeId/roots/:rootHash/history', (c) => {
  const treeId = c.req.param('treeId') ?? '';
  const rootHash = c.req.param('rootHash') ?? '';
  if (!HASH_RE.test(treeId) || !HASH_RE.test(rootHash)) {
    return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  }
  const services = getServices(c);
  if (!services.objects.rootOfTree(treeId, rootHash)) {
    return errorResponse(ErrorCodes.OBJECT_NOT_FOUND, 'Root not found in this tree', 404);
  }
  const limit = parseLimit(c, 20, 100);
  return c.json(services.objects.rootHistory(treeId, rootHash, limit, c.req.query('cursor')));
});

trees.get('/:treeId/roots/:rootHash', (c) => {
  const treeId = c.req.param('treeId') ?? '';
  const rootHash = c.req.param('rootHash') ?? '';
  if (!HASH_RE.test(treeId) || !HASH_RE.test(rootHash)) {
    return errorResponse(ErrorCodes.OBJECT_NOT_FOUND, 'Root not found in this tree', 404);
  }
  const services = getServices(c);
  const root = services.objects.rootOfTree(treeId, rootHash);
  if (!root) return errorResponse(ErrorCodes.OBJECT_NOT_FOUND, 'Root not found in this tree', 404);
  return c.json(root);
});

trees.get('/:treeId/resolve', async (c) => {
  const treeId = c.req.param('treeId') ?? '';
  const rootHash = c.req.query('root');
  const path = c.req.query('path');
  if (!HASH_RE.test(treeId)) return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  if (!rootHash || !HASH_RE.test(rootHash) || !path) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'root (rootHash) and path query params are required', 400);
  }
  const services = getServices(c);
  const resolved = await services.objects.resolvePath(treeId, rootHash, path);
  if (!resolved) return errorResponse(ErrorCodes.PATH_NOT_FOUND, 'Path not found', 404);
  return c.json(resolved);
});

trees.get('/:treeId', currentRefsHandler);

// GET /v1/reviews — query review messages (HB § 4 convenience index).
reviews.get('/', (c) => {
  const treeId = c.req.query('tree');
  if (!treeId || !HASH_RE.test(treeId)) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'tree (treeId) query param is required', 400);
  }
  const services = getServices(c);
  if (!services.objects.treeExists(treeId)) {
    return errorResponse(ErrorCodes.CAP_TREE_UNKNOWN, 'Tree not found', 404);
  }
  const limit = parseLimit(c, 20, 100);
  const result = services.objects.queryReviews({
    treeId,
    type: c.req.query('type'),
    recipient: c.req.query('recipient'),
    outcome: c.req.query('outcome'),
    root: c.req.query('root'),
    limit,
    cursor: c.req.query('cursor'),
  });
  return c.json(result);
});

export { trees, reviews };
