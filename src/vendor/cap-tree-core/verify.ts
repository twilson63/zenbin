/**
 * The normative verification algorithms — data-model § 6.
 *
 * Everything here is courier-agnostic: the caller supplies a Resolver that
 * fetches envelopes by reference, and every fetched payload is checked
 * against the reference hash before it is believed. A malicious resolver
 * can withhold objects; it cannot make verification pass.
 */
import { verifyEnvelope, objectHash, type SignatureEnvelope } from './crypto.js';
import {
  validateObject,
  type ObjectRef, type TreeRoot, type Refs, type ReviewResponse,
} from './objects.js';

/** Fetch an envelope by reference. Return null if unavailable. */
export type Resolver = (ref: ObjectRef) => Promise<SignatureEnvelope | null>;

export interface Verdict {
  ok: boolean;
  errors: string[];
}

/** § 6.1 — envelope signature + specVersion + structural validity. */
export async function verifyObject(env: SignatureEnvelope): Promise<Verdict & { hash: string }> {
  const sig = await verifyEnvelope(env);
  const errors = [...sig.errors, ...validateObject(env.payload)];
  return { ok: errors.length === 0, hash: sig.hash, errors };
}

/** Resolve a ref and require the payload to hash to ref.hash. */
async function resolveVerified(
  ref: ObjectRef,
  resolve: Resolver,
  errors: string[],
  what: string
): Promise<SignatureEnvelope | null> {
  const env = await resolve(ref);
  if (env === null) {
    errors.push(`${what}: object ${ref.hash} is unavailable`);
    return null;
  }
  const actual = await objectHash(env.payload);
  if (actual !== ref.hash) {
    errors.push(`${what}: retrieved bytes hash to ${actual}, reference pins ${ref.hash}`);
    return null;
  }
  return env;
}

export interface ChainVerdict extends Verdict {
  /** Every verified ancestor root, keyed by objectHash. */
  roots: Map<string, { env: SignatureEnvelope<TreeRoot>; payload: TreeRoot }>;
  genesisHash: string | null;
}

/**
 * § 6.2 — verify a root's ancestry back to a trusted treeId.
 *
 * Walks all parents (the full DAG), verifies every ancestor's envelope and
 * hash pin, requires exactly one genesis whose hash equals treeId, and
 * checks each root's signer against the owner active at that point in
 * history (key rotation, § 7.2: a root's owner is its first parent's owner
 * unless that parent declares rotateTo).
 */
export async function verifyRootChain(
  rootEnv: SignatureEnvelope<TreeRoot>,
  treeId: string,
  resolve: Resolver
): Promise<ChainVerdict> {
  const errors: string[] = [];
  const roots = new Map<string, { env: SignatureEnvelope<TreeRoot>; payload: TreeRoot }>();
  let genesisHash: string | null = null;

  // Phase 1: collect and individually verify the ancestor DAG.
  const tipVerdict = await verifyObject(rootEnv);
  errors.push(...tipVerdict.errors.map((e) => `root ${tipVerdict.hash}: ${e}`));
  roots.set(tipVerdict.hash, { env: rootEnv, payload: rootEnv.payload });

  const queue: TreeRoot[] = [rootEnv.payload];
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const parentRef of current.parents) {
      if (roots.has(parentRef.hash)) continue;
      const env = (await resolveVerified(parentRef, resolve, errors, 'ancestor walk')) as SignatureEnvelope<TreeRoot> | null;
      if (!env) continue;
      const v = await verifyObject(env);
      errors.push(...v.errors.map((e) => `root ${v.hash}: ${e}`));
      if (env.payload.type !== 'tree-root') {
        errors.push(`ancestor ${parentRef.hash} is not a tree-root`);
        continue;
      }
      roots.set(parentRef.hash, { env, payload: env.payload });
      queue.push(env.payload);
    }
  }

  // Phase 2: exactly one genesis, equal to treeId.
  const genesisHashes: string[] = [];
  for (const [hash, { payload }] of roots) {
    if (payload.parents.length === 0) genesisHashes.push(hash);
  }
  if (genesisHashes.length !== 1) {
    errors.push(`expected exactly one genesis root in the ancestry, found ${genesisHashes.length}`);
  } else {
    genesisHash = genesisHashes[0]!;
    if (genesisHash !== treeId) {
      errors.push(`genesis root hashes to ${genesisHash}, which is not the trusted treeId ${treeId}`);
    }
  }

  // Phase 3: signer authority with rotation along first-parent lineage.
  if (genesisHash === treeId && genesisHash !== null) {
    const ownerOf = new Map<string, string>(); // rootHash -> active owner fingerprint
    const ownerFor = (hash: string): string | null => {
      if (ownerOf.has(hash)) return ownerOf.get(hash)!;
      const node = roots.get(hash);
      if (!node) return null;
      let owner: string | null;
      if (node.payload.parents.length === 0) {
        owner = node.payload.ownerFingerprint;
      } else {
        const firstParentHash = node.payload.parents[0]!.hash;
        const parent = roots.get(firstParentHash);
        owner = parent ? (parent.payload.rotateTo ?? ownerFor(firstParentHash)) : null;
      }
      if (owner !== null) ownerOf.set(hash, owner);
      return owner;
    };
    for (const [hash, { env, payload }] of roots) {
      const owner = ownerFor(hash);
      if (owner === null) continue; // unresolvable ancestry already reported
      if (env.signerFingerprint !== owner) {
        errors.push(`root ${hash} signed by ${env.signerFingerprint}, but the active owner is ${owner}`);
      }
      if (payload.ownerFingerprint !== owner) {
        errors.push(`root ${hash} declares ownerFingerprint ${payload.ownerFingerprint}, but the active owner is ${owner}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, roots, genesisHash };
}

export interface MergeVerdict extends Verdict {
  /** Whether the merge satisfies the policy of its first parent (§ 6.3). */
  policySatisfied: boolean;
  countedApprovals: number;
  requiredApprovals: number;
}

/**
 * § 6.3 — verify a merge root against the declared policy of its target.
 *
 * A merge that fails policy is still a valid object; callers MUST surface
 * `policySatisfied: false` and MUST NOT present the merge as approved.
 */
export async function verifyMerge(
  mergeEnv: SignatureEnvelope<TreeRoot>,
  treeId: string,
  resolve: Resolver
): Promise<MergeVerdict> {
  const merge = mergeEnv.payload;
  const chain = await verifyRootChain(mergeEnv, treeId, resolve);
  const errors = [...chain.errors];

  if (merge.parents.length < 2) {
    errors.push('a merge root must have two or more parents');
    return { ok: false, errors, policySatisfied: false, countedApprovals: 0, requiredApprovals: 0 };
  }

  const target = chain.roots.get(merge.parents[0]!.hash);
  const policy = target?.payload.policy ?? null;
  if (policy === null) {
    return { ok: errors.length === 0, errors, policySatisfied: errors.length === 0, countedApprovals: 0, requiredApprovals: 0 };
  }

  const mergedHashes = new Set(merge.parents.slice(1).map((p) => p.hash));
  const policyErrors: string[] = [];
  const countedReviewers = new Set<string>();

  for (const ref of merge.approvals) {
    const env = (await resolveVerified(ref, resolve, policyErrors, 'approval')) as SignatureEnvelope<ReviewResponse> | null;
    if (!env) continue;
    const v = await verifyObject(env);
    if (!v.ok) { policyErrors.push(`approval ${ref.hash}: ${v.errors.join('; ')}`); continue; }
    const r = env.payload;
    if (r.type !== 'review-response') { policyErrors.push(`approval ${ref.hash} is not a review-response`); continue; }
    if (r.outcome !== 'approved') { policyErrors.push(`approval ${ref.hash} has outcome "${r.outcome}", not "approved"`); continue; }
    if (env.signerFingerprint !== r.reviewerFingerprint) { policyErrors.push(`approval ${ref.hash} signer differs from its reviewerFingerprint`); continue; }
    if (!mergedHashes.has(r.root.hash)) { policyErrors.push(`approval ${ref.hash} approves root ${r.root.hash}, which is not among the merged parents`); continue; }
    if (policy.reviewers.length > 0 && !policy.reviewers.includes(r.reviewerFingerprint)) { policyErrors.push(`approval ${ref.hash}: reviewer is not in the policy's reviewer set`); continue; }
    if (!policy.selfReview && r.reviewerFingerprint === mergeEnv.signerFingerprint) { policyErrors.push(`approval ${ref.hash}: self-review is not permitted by policy`); continue; }
    if (policy.reviewers.length === 0 && r.reviewerFingerprint === mergeEnv.signerFingerprint) { policyErrors.push(`approval ${ref.hash}: with an open reviewer set, the merge signer's own approval does not count`); continue; }
    countedReviewers.add(r.reviewerFingerprint); // at most one approval per reviewer
  }

  const policySatisfied = countedReviewers.size >= policy.requiredApprovals;
  if (!policySatisfied) {
    policyErrors.push(`policy requires ${policy.requiredApprovals} approval(s), counted ${countedReviewers.size}`);
    errors.push(...policyErrors);
  }

  return {
    ok: errors.length === 0 && policySatisfied,
    errors,
    policySatisfied: policySatisfied && chain.ok,
    countedApprovals: countedReviewers.size,
    requiredApprovals: policy.requiredApprovals,
  };
}

export interface RefsVerdict extends Verdict {
  /** True when two distinct refs objects claim the same seq (§ 3.4 / § 6.4). */
  equivocation: boolean;
}

/**
 * § 6.4 — verify a refs object, optionally against the previously observed
 * refs envelope for the same tree.
 */
export async function verifyRefs(
  refsEnv: SignatureEnvelope<Refs>,
  opts: {
    treeId: string;
    resolve: Resolver;
    /** The last refs envelope this client observed and verified, if any. */
    previous?: SignatureEnvelope<Refs>;
    /** Skip branch-target chain walks (cheaper; pins still checked by callers). */
    skipTargetWalks?: boolean;
  }
): Promise<RefsVerdict> {
  const errors: string[] = [];
  let equivocation = false;
  const v = await verifyObject(refsEnv);
  errors.push(...v.errors);
  const refs = refsEnv.payload;

  if (refs.treeId !== opts.treeId) {
    errors.push(`refs object is for tree ${refs.treeId}, expected ${opts.treeId}`);
  }

  // Owner check: the genesis root's owner (with rotations) must have signed.
  // We verify via any branch target's chain; the cheapest authoritative
  // source of current ownership is the chain walk itself.
  if (opts.previous) {
    const prevHash = await objectHash(opts.previous.payload);
    const prev = opts.previous.payload;
    if (refs.seq <= prev.seq) {
      const sameObject = (await objectHash(refs)) === prevHash;
      if (!sameObject) {
        equivocation = true;
        errors.push(`equivocation: observed refs seq ${prev.seq}, received a different object at seq ${refs.seq}`);
      }
    } else if (refs.seq === prev.seq + 1 && refs.prev !== prevHash) {
      errors.push(`refs.prev is ${refs.prev}, expected hash of the previously observed refs object ${prevHash}`);
    }
  }

  if (!opts.skipTargetWalks) {
    for (const [group, m] of [['branches', refs.branches], ['tags', refs.tags]] as const) {
      for (const [name, ref] of Object.entries(m)) {
        const env = (await resolveVerified(ref, opts.resolve, errors, `${group}.${name}`)) as SignatureEnvelope<TreeRoot> | null;
        if (!env) continue;
        const chain = await verifyRootChain(env, opts.treeId, opts.resolve);
        if (!chain.ok) errors.push(`${group}.${name}: ${chain.errors.join('; ')}`);
        if (refsEnv.signerFingerprint && env && chain.genesisHash === opts.treeId) {
          // Refs must be signed by the active owner at the branch tip.
          const tipOwner = env.payload.rotateTo ?? env.payload.ownerFingerprint;
          if (refsEnv.signerFingerprint !== tipOwner && refsEnv.signerFingerprint !== env.payload.ownerFingerprint) {
            errors.push(`refs signed by ${refsEnv.signerFingerprint}, but the tree owner is ${env.payload.ownerFingerprint}`);
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, equivocation };
}
