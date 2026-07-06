/**
 * SubdomainService — wraps all subdomain storage operations
 *
 * Adds plan limit enforcement and usage tracking on top of raw DB ops.
 */

import {
  saveSubdomain as dbSaveSubdomain,
  getSubdomain as dbGetSubdomain,
  deleteSubdomain as dbDeleteSubdomain,
  getSubdomainCount as dbGetSubdomainCount,
  incrementSubdomainPageCount as dbIncrementSubdomainPageCount,
  decrementSubdomainPageCount as dbDecrementSubdomainPageCount,
  reserveAndClaimSubdomain as dbReserveAndClaimSubdomain,
  countSubdomainsByOwner as dbCountSubdomainsByOwner,
  transferSubdomainOwnership as transferSubdomainOwnershipDb,
  releaseSubdomain as releaseSubdomainDb,
  incrementAgentKeyUsage,
  getAgentKey,
} from '../storage/db.js';
import { config } from '../config.js';
import { checkSubdomainLimit, getPlanFromKey } from '../rules.js';
import type { Subdomain, SubdomainResult, LimitCheckResult, Plan } from '../types.js';
import type { ISubdomainService } from './interfaces.js';

export class SubdomainService implements ISubdomainService {
  async save(name: string, ownerKeyId?: string): Promise<SubdomainResult> {
    const result = await dbSaveSubdomain(name, ownerKeyId);
    return result;
  }

  get(name: string): Subdomain | undefined {
    return dbGetSubdomain(name);
  }

  async delete(name: string): Promise<boolean> {
    // dbDeleteSubdomain performs the cascade delete for pages under this subdomain.
    return dbDeleteSubdomain(name);
  }

  count(): number {
    return dbGetSubdomainCount();
  }

  incrementPageCount(name: string): void {
    dbIncrementSubdomainPageCount(name);
  }

  decrementPageCount(name: string): void {
    dbDecrementSubdomainPageCount(name);
  }

  /**
   * Check if a subdomain claim is allowed under the current plan.
   * Enforced against the number of subdomains the key actually OWNS (a stable
   * ownership cap), not a monthly counter that resets every billing cycle.
   */
  checkClaimLimit(keyId: string): LimitCheckResult {
    const agentKey = getAgentKey(keyId);
    const plan = agentKey ? getPlanFromKey(agentKey) : 'free';
    return checkSubdomainLimit(plan, keyId ? dbCountSubdomainsByOwner(keyId) : 0);
  }

  /**
   * Atomically enforce the ownership cap and claim the subdomain in one
   * transaction (closes the concurrent-claim race). created=false means the
   * name already existed.
   */
  reserveAndClaim(
    name: string,
    ownerKeyId: string | undefined,
    plan: Plan,
  ): { allowed: boolean; reason?: string; created: boolean; subdomain?: Subdomain } {
    return dbReserveAndClaimSubdomain(name, ownerKeyId, plan);
  }

  /**
   * Track subdomain creation for billing purposes.
   * Call after a successful subdomain claim.
   */
  trackSubdomainClaim(keyId: string): void {
    incrementAgentKeyUsage(keyId, 'monthlySubdomainCount');
  }

  /**
   * Validate a subdomain name.
   * Delegates to the same rules used in the subdomain route.
   */
  validateName(name: string): { valid: boolean; error?: string } {
    const RESERVED_NAMES = new Set(config.subdomains.reservedNames);
    const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

    if (name.length < 3) {
      return { valid: false, error: 'Subdomain must be at least 3 characters' };
    }
    if (name.length > config.subdomains.maxLength) {
      return { valid: false, error: `Subdomain must be at most ${config.subdomains.maxLength} characters` };
    }
    if (!SUBDOMAIN_PATTERN.test(name)) {
      return { valid: false, error: 'Subdomain must start with a letter, contain only lowercase letters, numbers, and hyphens, and end with a letter or number' };
    }
    if (RESERVED_NAMES.has(name)) {
      return { valid: false, error: `Subdomain '${name}' is reserved` };
    }

    return { valid: true };
  }

  /**
   * Transfer subdomain ownership to a new key.
   * Validates the subdomain exists and the target key is registered + active.
   * Does NOT touch pages.
   */
  transferOwnership(name: string, newOwnerKeyId: string): { subdomain?: Subdomain; error?: string; status?: number } {
    const existing = this.get(name);
    if (!existing) {
      return { error: `Subdomain '${name}' not found`, status: 404 };
    }

    const targetKey = getAgentKey(newOwnerKeyId);
    if (!targetKey) {
      return { error: `Key '${newOwnerKeyId}' not found`, status: 400 };
    }
    if (targetKey.status !== 'active') {
      return { error: `Key '${newOwnerKeyId}' is not active (status: ${targetKey.status})`, status: 400 };
    }

    const updated = transferSubdomainOwnershipDb(name, newOwnerKeyId);
    if (!updated) {
 return { error: `Subdomain '${name}' not found`, status: 404 };
    }

    return { subdomain: updated };
  }

  /**
   * Release subdomain ownership (clear ownerKeyId).
   * The subdomain becomes claimable by any key via POST /v1/subdomains/:name.
   * Does NOT touch pages.
   */
  releaseOwnership(name: string): { subdomain?: Subdomain; error?: string; status?: number } {
    const existing = this.get(name);
    if (!existing) {
      return { error: `Subdomain '${name}' not found`, status: 404 };
    }

    const updated = releaseSubdomainDb(name);
    if (!updated) {
      return { error: `Subdomain '${name}' not found`, status: 404 };
    }

    return { subdomain: updated };
  }
}