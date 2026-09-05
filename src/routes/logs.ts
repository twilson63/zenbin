import { Hono } from 'hono';
import { acceptLogTransfer, appendLogEntry, cancelLogTransfer, createLog, getLog, nominateLogOwner, readLogEntries, updateLogWriters } from '../storage/logs.js';
import { logLimits, verifyLogSignature, type LogSigner } from '../utils/logSignature.js';
import { isValidFingerprint } from '../utils/fingerprint.js';
import { validateId } from '../utils/validation.js';

const logs = new Hono<{ Variables: { logSigner: LogSigner; logBody: Record<string, unknown> } }>();

logs.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  if (!['POST', 'PUT', 'DELETE'].includes(c.req.method)) return next();
  if (new URL(c.req.url).search) return c.json({ error: 'Log writes do not accept query parameters' }, 400);
  if (c.req.header('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return c.json({ error: 'Content-Type must be application/json' }, 400);
  }

  // Count actual bytes, even if Content-Length is absent or inaccurate.
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = c.req.raw.body?.getReader();
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > logLimits.bodyBytes) {
          await reader.cancel();
          return c.json({ error: 'Log request body exceeds 64 KiB' }, 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  const rawBody = Buffer.concat(chunks, size);
  const signer = verifyLogSignature(c.req.method, new URL(c.req.url).pathname, c.req.raw.headers, rawBody);
  if ('error' in signer) return c.json({ error: signer.error }, signer.status);
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(rawBody));
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ error: 'Request body must be a JSON object' }, 400);
  }
  c.set('logSigner', signer);
  c.set('logBody', body as Record<string, unknown>);
  return next();
});

function validLogId(id: string): boolean {
  return id !== '.' && id !== '..' && validateId(id) === null;
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && isValidFingerprint(value) && Buffer.from(value, 'base64url').toString('base64url') === value;
}
function validWriters(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= logLimits.writers && value.every(validFingerprint) && new Set(value).size === value.length;
}
function validRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

logs.put('/:id/writers', async (c) => {
  const id = c.req.param('id');
  const body = c.get('logBody');
  if (!validLogId(id) || Object.keys(body).some((key) => !['allowed_writers', 'expected_revision'].includes(key)) || !validWriters(body.allowed_writers) || !validRevision(body.expected_revision)) {
    return c.json({ error: 'Provide a valid log ID, allowed_writers and expected_revision' }, 400);
  }
  const result = await updateLogWriters(id, body.allowed_writers, body.expected_revision, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value);
});

logs.post('/:id/transfer', async (c) => {
  const id = c.req.param('id');
  const body = c.get('logBody');
  if (!validLogId(id) || Object.keys(body).some((key) => !['new_owner_fingerprint', 'expected_revision', 'retain_previous_owner'].includes(key)) ||
      !validFingerprint(body.new_owner_fingerprint) || !validRevision(body.expected_revision) ||
      (body.retain_previous_owner !== undefined && typeof body.retain_previous_owner !== 'boolean')) {
    return c.json({ error: 'Provide a valid new_owner_fingerprint, expected_revision and optional boolean retain_previous_owner' }, 400);
  }
  if (body.new_owner_fingerprint === c.get('logSigner').fingerprint) return c.json({ error: 'New owner must be a different agent' }, 400);
  const result = await nominateLogOwner(id, body.new_owner_fingerprint, body.retain_previous_owner === true, body.expected_revision, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value);
});

logs.post('/:id/transfer/accept', async (c) => {
  const id = c.req.param('id');
  const body = c.get('logBody');
  if (!validLogId(id) || Object.keys(body).some((key) => key !== 'expected_revision') || !validRevision(body.expected_revision)) {
    return c.json({ error: 'Provide a valid log ID and expected_revision' }, 400);
  }
  const result = await acceptLogTransfer(id, body.expected_revision, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value);
});

logs.delete('/:id/transfer', async (c) => {
  const id = c.req.param('id');
  const body = c.get('logBody');
  if (!validLogId(id) || Object.keys(body).some((key) => key !== 'expected_revision') || !validRevision(body.expected_revision)) {
    return c.json({ error: 'Provide a valid log ID and expected_revision' }, 400);
  }
  const result = await cancelLogTransfer(id, body.expected_revision, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value);
});

logs.post('/:id', async (c) => {
  const id = c.req.param('id');
  if (!validLogId(id)) return c.json({ error: 'Invalid log ID' }, 400);
  const body = c.get('logBody');
  if (Object.keys(body).some((key) => key !== 'allowed_writers')) return c.json({ error: 'Unknown log field' }, 400);
  const writers = body.allowed_writers === undefined ? [] : body.allowed_writers;
  if (!validWriters(writers)) return c.json({ error: 'allowed_writers must contain at most 100 unique base64url SHA-256 fingerprints' }, 400);
  const result = await createLog(id, writers, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value, 201);
});

logs.post('/:id/entries', async (c) => {
  const id = c.req.param('id');
  if (!validLogId(id)) return c.json({ error: 'Invalid log ID' }, 400);
  const body = c.get('logBody');
  if (Object.keys(body).some((key) => key !== 'metadata')) return c.json({ error: 'Unknown entry field' }, 400);
  if (typeof body.metadata !== 'string') return c.json({ error: 'metadata must be a JSON string' }, 400);
  if (Buffer.byteLength(body.metadata, 'utf8') > logLimits.metadataBytes) return c.json({ error: 'metadata exceeds 16 KiB' }, 413);
  try {
    JSON.parse(body.metadata);
  } catch {
    return c.json({ error: 'metadata must contain valid JSON' }, 400);
  }
  const result = await appendLogEntry(id, body.metadata, c.get('logSigner'));
  if ('error' in result) return c.json({ error: result.error }, result.status);
  return c.json(result.value, 201);
});

logs.get('/:id', (c) => {
  const id = c.req.param('id');
  if (!validLogId(id)) return c.json({ error: 'Invalid log ID' }, 400);
  if (new URL(c.req.url).search) return c.json({ error: 'Log description does not accept query parameters' }, 400);
  const log = getLog(id);
  if (!log) return c.json({ error: 'Log not found' }, 404);
  return c.json(log);
});

logs.get('/:id/entries', (c) => {
  const id = c.req.param('id');
  if (!validLogId(id)) return c.json({ error: 'Invalid log ID' }, 400);
  const query = new URL(c.req.url).searchParams;
  if ([...query.keys()].some((key) => !['after', 'limit'].includes(key)) || query.getAll('after').length > 1 || query.getAll('limit').length > 1) {
    return c.json({ error: 'Use only one after and limit parameter' }, 400);
  }
  const after = query.get('after') ?? '0';
  const limit = query.get('limit') ?? '50';
  if (!/^(0|[1-9]\d*)$/.test(after) || !Number.isSafeInteger(Number(after)) ||
      !/^[1-9]\d*$/.test(limit) || Number(limit) > logLimits.pageSize) {
    return c.json({ error: 'after must be a nonnegative safe integer; limit must be 1–100' }, 400);
  }
  if (!getLog(id)) return c.json({ error: 'Log not found' }, 404);
  return c.json(readLogEntries(id, Number(after), Number(limit)));
});

export { logs };
