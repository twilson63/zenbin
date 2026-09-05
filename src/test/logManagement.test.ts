import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { open } from 'lmdb';
import { config } from '../config.js';
import { createAgent, registerLogAgents } from './logHelpers.js';
import { saveAgentKey, updateAgentKeyStatus } from '../storage/db.js';
import { acceptLogTransfer, appendLogEntry, cancelLogTransfer, closeLogDatabase, createLog, getLog, initLogDatabase, nominateLogOwner, readLogEntries, updateLogWriters } from '../storage/logs.js';
const owner = createAgent();
const writer = createAgent();
const next = createAgent();
const outsider = createAgent();
beforeAll(async () => { await registerLogAgents(); initLogDatabase(); });
afterAll(closeLogDatabase);

describe('Atomic log management', () => {
  it('adds/removes writers, rejects outsiders and stale revisions, preserves entry cursors', async () => {
    await createLog('acl', [], owner.identity());
    expect(await updateLogWriters('acl', [writer.fingerprint], 0, outsider.identity())).toMatchObject({ status: 403 });
    expect(await updateLogWriters('acl', [writer.fingerprint], 0, owner.identity())).toMatchObject({ value: { revision: 1 } });
    await appendLogEntry('acl', '{"event":"before"}', writer.identity());
    expect(getLog('acl')?.revision).toBe(1);
    expect(await updateLogWriters('acl', [], 0, owner.identity())).toMatchObject({ status: 409 });
    expect(await updateLogWriters('acl', [], 1, owner.identity())).toMatchObject({ value: { revision: 2 } });
    expect(await appendLogEntry('acl', '{}', writer.identity())).toMatchObject({ status: 403 });
    expect(await appendLogEntry('acl', '{}', owner.identity())).toMatchObject({ value: { sequence: 2 } });
    expect(readLogEntries('acl', 0, 100).entries[0].agent_fingerprint).toBe(writer.fingerprint);
  });
  it('serializes competing revision edits and appends around revocation', async () => {
    await createLog('race', [writer.fingerprint], owner.identity());
    const results = await Promise.all([updateLogWriters('race', [], 0, owner.identity()), updateLogWriters('race', [outsider.fingerprint], 0, owner.identity()), appendLogEntry('race', '{}', writer.identity())]);
    expect(results[0]).toMatchObject({ value: { revision: 1 } });
    expect(results[1]).toMatchObject({ status: 409 });
    expect(results[2]).toMatchObject({ status: 403 });
    expect(getLog('race')?.entry_count).toBe(0);
  });
  it('nominates, cancels and replaces without granting premature owner rights', async () => {
    await createLog('nomination', [], owner.identity());
    expect(await cancelLogTransfer('nomination', 0, owner.identity())).toMatchObject({ status: 409 });
    expect(await nominateLogOwner('nomination', next.fingerprint, false, 0, owner.identity())).toMatchObject({ value: { revision: 1, pending_transfer: { new_owner_fingerprint: next.fingerprint } } });
    expect(await updateLogWriters('nomination', [], 1, next.identity())).toMatchObject({ status: 403 });
    expect(await appendLogEntry('nomination', '{}', next.identity())).toMatchObject({ status: 403 });
    await appendLogEntry('nomination', '{}', owner.identity());
    expect(getLog('nomination')?.pending_transfer?.new_owner_fingerprint).toBe(next.fingerprint);
    expect(await cancelLogTransfer('nomination', 1, outsider.identity())).toMatchObject({ status: 403 });
    await cancelLogTransfer('nomination', 1, owner.identity());
    expect(await acceptLogTransfer('nomination', 1, next.identity())).toMatchObject({ status: 409 });
    await nominateLogOwner('nomination', next.fingerprint, false, 2, owner.identity());
    await nominateLogOwner('nomination', writer.fingerprint, false, 3, owner.identity());
    expect(await acceptLogTransfer('nomination', 3, next.identity())).toMatchObject({ status: 403 });
    expect(await acceptLogTransfer('nomination', 3, writer.identity())).toMatchObject({ status: 409 });
    expect(await acceptLogTransfer('nomination', 4, writer.identity())).toMatchObject({ value: { revision: 5, owner_fingerprint: writer.fingerprint, pending_transfer: null } });
  });
  it('removes former owner even if explicitly allowlisted and preserves history', async () => {
    await createLog('handoff', [owner.fingerprint, writer.fingerprint, next.fingerprint], owner.identity());
    await appendLogEntry('handoff', 'null', owner.identity());
    const history = readLogEntries('handoff', 0, 100);
    await nominateLogOwner('handoff', next.fingerprint, false, 0, owner.identity());
    expect(await acceptLogTransfer('handoff', 1, outsider.identity())).toMatchObject({ status: 403 });
    await acceptLogTransfer('handoff', 1, next.identity());
    expect(getLog('handoff')?.allowed_writers).toEqual([writer.fingerprint]);
    expect(await appendLogEntry('handoff', '{}', owner.identity())).toMatchObject({ status: 403 });
    expect(await updateLogWriters('handoff', [], 2, owner.identity())).toMatchObject({ status: 403 });
    expect(readLogEntries('handoff', 0, 100)).toEqual(history);
    expect(await appendLogEntry('handoff', '{}', next.identity())).toMatchObject({ value: { sequence: 2 } });
  });
  it('retains the previous owner only as a writer when requested', async () => {
    await createLog('retained', [], owner.identity());
    await nominateLogOwner('retained', next.fingerprint, true, 0, owner.identity());
    await acceptLogTransfer('retained', 1, next.identity());
    expect(getLog('retained')?.allowed_writers).toEqual([owner.fingerprint]);
    expect(await appendLogEntry('retained', '{}', owner.identity())).toHaveProperty('value');
    expect(await updateLogWriters('retained', [], 2, owner.identity())).toMatchObject({ status: 403 });
  });
  it('fails over-capacity retention without consuming nonce or changing pending state', async () => {
    const writers = Array.from({ length: 100 }, (_, i) => Buffer.from(String(i).padStart(32, '0')).toString('base64url'));
    await createLog('retain-full', writers, owner.identity());
    await nominateLogOwner('retain-full', next.fingerprint, true, 0, owner.identity());
    const acceptance = next.identity();
    expect(await acceptLogTransfer('retain-full', 1, acceptance)).toMatchObject({ status: 409 });
    expect(getLog('retain-full')?.revision).toBe(1);
    expect(getLog('retain-full')?.pending_transfer).not.toBeNull();
    await updateLogWriters('retain-full', [], 1, owner.identity());
    expect(await acceptLogTransfer('retain-full', 2, acceptance)).toHaveProperty('value');
  });
  it('gives exactly one winner to concurrent cancellation/acceptance', async () => {
    await createLog('cancel-race', [], owner.identity());
    await nominateLogOwner('cancel-race', next.fingerprint, false, 0, owner.identity());
    const results = await Promise.all([cancelLogTransfer('cancel-race', 1, owner.identity()), acceptLogTransfer('cancel-race', 1, next.identity())]);
    expect(results.filter((r) => 'value' in r)).toHaveLength(1);
    expect(getLog('cancel-race')?.owner_fingerprint).toBe(owner.fingerprint);
  });
  it('preserves pending transfer, revisions, history and replay across restart', async () => {
    await createLog('pending-restart', [], owner.identity());
    const nomination = owner.identity();
    await nominateLogOwner('pending-restart', next.fingerprint, false, 0, nomination);
    await closeLogDatabase(); initLogDatabase();
    expect(getLog('pending-restart')?.revision).toBe(1);
    expect(await updateLogWriters('pending-restart', [], 1, nomination)).toMatchObject({ status: 409 });
    expect(await appendLogEntry('pending-restart', '{}', nomination)).toMatchObject({ status: 409 });
    expect(await acceptLogTransfer('pending-restart', 1, next.identity())).toHaveProperty('value');
  });
  it('does not allow alias key registration to bypass fingerprint nonce checks', async () => {
    await saveAgentKey({ keyId: 'log-owner-alias', publicJwk: owner.publicJwk, scopes: [], status: 'active' });
    const signed = owner.identity();
    await createLog('alias', [], signed);
    expect(await appendLogEntry('alias', '{}', { ...signed, keyId: 'log-owner-alias' })).toMatchObject({ status: 409 });
  });
  it('rechecks registry revocation at mutation time', async () => {
    await createLog('blocked-after-verification', [], outsider.identity());
    const signed = outsider.identity();
    await updateAgentKeyStatus(outsider.keyId, 'revoked');
    try {
      expect(await updateLogWriters('blocked-after-verification', [], 0, signed)).toMatchObject({ status: 403 });
    } finally { await updateAgentKeyStatus(outsider.keyId, 'active'); }
  });
  it('protects exact and future-skew expiry boundaries while allowing expired nonce cleanup', async () => {
    const base = Date.now();
    const skew = config.signedPublishing.maxTimestampSkewMs;
    const clock = vi.spyOn(Date, 'now');
    try {
      clock.mockReturnValue(base);
      const signed = owner.identity(undefined, base + skew);
      await createLog('expiry', [], signed);
      clock.mockReturnValue(base + 2 * skew);
      await createLog('expiry-cleanup', [], owner.identity());
      expect(await appendLogEntry('expiry', '{}', signed)).toMatchObject({ status: 409 });
      clock.mockReturnValue(base + 2 * skew + 1);
      await createLog('expiry-cleanup-later', [], owner.identity());
      expect(await appendLogEntry('expiry', '{}', signed)).toMatchObject({ status: 401 });
      expect(await appendLogEntry('expiry', '{}', owner.identity(signed.nonce))).toHaveProperty('value');
    } finally { clock.mockRestore(); }
  });
  it('normalizes legacy fields lazily and guards revision overflow', async () => {
    await createLog('legacy', [], owner.identity());
    const saved = getLog('legacy')!;
    await closeLogDatabase();
    const db = open({ path: `${config.lmdbPath}-logs`, name: 'logs', compression: true });
    const { revision, pending_transfer, ...legacy } = saved;
    db.putSync('legacy', legacy);
    db.putSync('overflow', { ...saved, id: 'overflow', revision: Number.MAX_SAFE_INTEGER });
    await db.close(); initLogDatabase();
    expect(getLog('legacy')).toMatchObject({ revision: 0, pending_transfer: null });
    expect(await updateLogWriters('legacy', [], 0, owner.identity())).toMatchObject({ value: { revision: 1 } });
    expect(await updateLogWriters('overflow', [], Number.MAX_SAFE_INTEGER, owner.identity())).toMatchObject({ status: 409 });
  });
});
