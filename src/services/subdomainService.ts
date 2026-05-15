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
  incrementAgentKeyUsage,
  getAgentKey,
} from '../storage/db.js';
import { checkSubdomainLimit, getPlanFromKey } from '../rules.js';
import type { Subdomain, SubdomainResult, LimitCheckResult } from '../types.js';
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
   */
  checkClaimLimit(keyId: string): LimitCheckResult {
    const agentKey = getAgentKey(keyId);
    const plan = agentKey ? getPlanFromKey(agentKey) : 'free';
    return checkSubdomainLimit(plan, agentKey?.monthlySubdomainCount || 0);
  }

  /**
   * Track subdomain creation for billing purposes.
   * Call after a successful subdomain claim.
   */
  trackSubdomainClaim(keyId: string): void {
    incrementAgentKeyUsage(keyId, 'monthlySubdomainCount');
  }
}