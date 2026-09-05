import { beforeAll, afterAll, expect, it } from 'vitest';
import { createAgent, registerLogAgents } from './logHelpers.js';
const agent = createAgent();
import { appendLogEntry, closeLogDatabase, createLog, getLog, initLogDatabase, readLogEntries } from '../storage/logs.js';
import { logLimits } from '../utils/logSignature.js';

// Exercise the actual capacity branch at a small limit without generating 100,000 writes.
const originalLimit = logLimits.entries;
beforeAll(async () => {
  await registerLogAgents();
  Object.defineProperty(logLimits, 'entries', { value: 3 });
  initLogDatabase();
});
afterAll(async () => {
  Object.defineProperty(logLimits, 'entries', { value: originalLimit });
  await closeLogDatabase();
});

it('accepts the final slot, rejects overflow atomically, and does not consume a rejected nonce', async () => {
  const signer = () => agent.identity();
  await createLog('capacity', [], signer());
  await createLog('other', [], signer());
  for (let i = 1; i <= 2; i++) expect(await appendLogEntry('capacity', '{}', signer())).toMatchObject({ value: { sequence: i } });
  const first = signer();
  const second = signer();
  const results = await Promise.all([appendLogEntry('capacity', '{}', first), appendLogEntry('capacity', '{}', second)]);
  expect(results[0]).toMatchObject({ value: { sequence: 3 } });
  expect(results[1]).toMatchObject({ status: 409, error: 'Log entry limit reached' });
  expect(getLog('capacity')?.entry_count).toBe(3);
  expect(readLogEntries('capacity', 0, 100).entries).toHaveLength(3);
  expect(await appendLogEntry('other', '{}', second)).toMatchObject({ value: { sequence: 1 } });
});
