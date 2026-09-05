import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { appendLogEntry, closeLogDatabase, createLog, getLog, initLogDatabase, readLogEntries } from '../storage/logs.js';

import { createAgent, registerLogAgents } from './logHelpers.js';
const agents = [createAgent(), createAgent(), createAgent()];
const [owner, writer, outsider] = agents.map((agent) => agent.fingerprint);
const signer = (fingerprint = owner, nonce = randomUUID()) => agents.find((agent) => agent.fingerprint === fingerprint)!.identity(nonce);
beforeAll(async () => { await registerLogAgents(); initLogDatabase(); });
afterAll(closeLogDatabase);

describe('Atomic public log storage', () => {
  it('allows IDs matching internal database names without collisions', async () => {
    for (const id of ['entries', 'nonces', 'logs']) {
      expect(await createLog(id, [], signer())).toHaveProperty('value');
      expect(await appendLogEntry(id, '{}', signer())).toMatchObject({ value: { sequence: 1 } });
      expect(getLog(id)?.id).toBe(id);
    }
  });
  it('creates once under concurrent claims and preserves the owner', async () => {
    const results = await Promise.all([createLog('claim', [writer], signer()), createLog('claim', [], signer(outsider))]);
    expect(results.filter((r) => 'value' in r)).toHaveLength(1);
    expect(results.filter((r) => 'error' in r)).toHaveLength(1);
    expect(getLog('claim')?.owner_fingerprint).toBe(owner);
    expect(getLog('claim')?.allowed_writers).toEqual([writer]);
  });

  it('allocates contiguous sequences under concurrent owner and allowlisted appends', async () => {
    await createLog('parallel', [writer], signer());
    const results = await Promise.all(Array.from({ length: 30 }, (_, index) => appendLogEntry('parallel', JSON.stringify({ index }), signer(index % 2 ? owner : writer))));
    expect(results.every((r) => 'value' in r)).toBe(true);
    expect(getLog('parallel')?.entry_count).toBe(30);
    const page = readLogEntries('parallel', 0, 100);
    expect(page.entries.map((e) => e.sequence)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(new Set(page.entries.map((e) => JSON.parse(e.metadata).index)).size).toBe(30);
    expect(new Set(page.entries.map((e) => e.agent_fingerprint))).toEqual(new Set([owner, writer]));
  });

  it('rejects outsiders without consuming their nonce or changing the log', async () => {
    await createLog('private-writers', [], signer());
    const request = signer(outsider);
    expect(await appendLogEntry('private-writers', '{}', request)).toMatchObject({ status: 403 });
    expect(getLog('private-writers')?.entry_count).toBe(0);
    expect(await createLog('outsider-own', [], request)).toHaveProperty('value');
    expect(await appendLogEntry('missing', '{}', signer())).toMatchObject({ status: 404 });
  });

  it('atomically rejects replay across logs but permits another signer to use the nonce', async () => {
    const request = signer();
    await createLog('replay', [writer], request);
    expect(await appendLogEntry('replay', '{}', request)).toMatchObject({ status: 409 });
    expect(await createLog('replay-other', [], request)).toMatchObject({ status: 409 });
    const duplicate = signer();
    const results = await Promise.all([appendLogEntry('replay', '{}', duplicate), appendLogEntry('replay', '{}', duplicate)]);
    expect(results.filter((r) => 'value' in r)).toHaveLength(1);
    expect(results.filter((r) => 'error' in r)).toHaveLength(1);
    expect(await appendLogEntry('replay', '{}', signer(writer, duplicate.nonce))).toHaveProperty('value');
    expect(getLog('replay')?.entry_count).toBe(2);
  });

  it('paginates without leaking similarly prefixed logs and retains empty cursors', async () => {
    for (const id of ['range', 'range-a', 'range.b']) {
      await createLog(id, [], signer());
      for (let i = 0; i < 3; i++) await appendLogEntry(id, JSON.stringify(id), signer());
    }
    expect(readLogEntries('range', 0, 2)).toMatchObject({ next_after: 2, has_more: true });
    const last = readLogEntries('range', 2, 2);
    expect(last.entries).toHaveLength(1);
    expect(last.entries[0].metadata).toBe('"range"');
    expect(last).toMatchObject({ next_after: 3, has_more: false });
    expect(readLogEntries('range', 3, 2)).toEqual({ entries: [], next_after: 3, has_more: false });
    expect(readLogEntries('range', Number.MAX_SAFE_INTEGER, 2)).toEqual({ entries: [], next_after: Number.MAX_SAFE_INTEGER, has_more: false });
    await appendLogEntry('range', 'null', signer());
    expect(readLogEntries('range', 3, 2).entries[0].sequence).toBe(4);
  });

  it('preserves definition, entries and nonces after close and reopen', async () => {
    const request = signer();
    await createLog('durable', [writer], request);
    const metadata = ' { "event": "ready", "unicode": "雪" } ';
    await appendLogEntry('durable', metadata, signer(writer));
    await closeLogDatabase();
    initLogDatabase();
    expect(getLog('durable')).toMatchObject({ owner_fingerprint: owner, allowed_writers: [writer], entry_count: 1 });
    expect(readLogEntries('durable', 0, 1).entries[0]).toMatchObject({ agent_fingerprint: writer, metadata });
    expect(await appendLogEntry('durable', '{}', request)).toMatchObject({ status: 409 });
    expect(await appendLogEntry('durable', '{}', signer())).toMatchObject({ value: { sequence: 2 } });
  });
});
