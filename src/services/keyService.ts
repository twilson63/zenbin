/**
 * KeyService — wraps agent key storage operations
 *
 * Provides billing-aware helpers for plan limit checks and cycle resets.
 */

import {
  saveAgentKey as dbSaveAgentKey,
  getAgentKey as dbGetAgentKey,
  listAgentKeys as dbListAgentKeys,
  getAgentKeyCount as dbGetAgentKeyCount,
  updateAgentKeyStatus as dbUpdateAgentKeyStatus,
  touchAgentKey as dbTouchAgentKey,
  updateAgentKeyPlan,
  incrementAgentKeyUsage,
  resetAgentKeyUsage,
} from '../storage/db.js';
import { checkPageLimit, checkSubdomainLimit, getPlanFromKey, isBillingCycleExpired } from '../rules.js';
import { config } from '../config.js';
import type { AgentKey, Plan, LimitCheckResult } from '../types.js';
import type { IKeyService } from './interfaces.js';

export class KeyService implements IKeyService {
  async save(input: {
    keyId: string;
    publicJwk: AgentKey['publicJwk'];
    scopes?: string[];
    status?: AgentKey['status'];
    plan?: Plan;
  }): Promise<AgentKey> {
    return dbSaveAgentKey(input);
  }

  get(keyId: string): AgentKey | undefined {
    return dbGetAgentKey(keyId);
  }

  list(): AgentKey[] {
    return dbListAgentKeys();
  }

  count(status?: AgentKey['status']): number {
    return dbGetAgentKeyCount(status);
  }

  async updateStatus(keyId: string, status: AgentKey['status'], reason?: string): Promise<AgentKey | undefined> {
    return dbUpdateAgentKeyStatus(keyId, status, reason);
  }

  async touch(keyId: string): Promise<void> {
    return dbTouchAgentKey(keyId);
  }

  async updatePlan(keyId: string, plan: Plan, stripeCustomerId?: string, subscriptionId?: string): Promise<AgentKey | undefined> {
    return updateAgentKeyPlan(keyId, plan, stripeCustomerId, subscriptionId);
  }

  async incrementUsage(keyId: string, field: 'monthlyPageCount' | 'monthlySubdomainCount'): Promise<void> {
    return incrementAgentKeyUsage(keyId, field);
  }

  async resetUsage(keyId: string): Promise<void> {
    return resetAgentKeyUsage(keyId);
  }

  /**
   * Get the plan for a given key ID. Returns 'free' if key not found.
   */
  getPlan(keyId: string): Plan {
    const agentKey = dbGetAgentKey(keyId);
    return agentKey ? getPlanFromKey(agentKey) : 'free';
  }

  /**
   * Check if a page publish is allowed for this key.
   * Only counts new pages — updates to existing pages are always allowed.
   */
  checkPageLimit(keyId: string, id: string, subdomain?: string): LimitCheckResult {
    const agentKey = dbGetAgentKey(keyId);
    const plan = agentKey ? getPlanFromKey(agentKey) : 'free';
    return checkPageLimit(plan, agentKey?.monthlyPageCount || 0);
  }

  /**
   * Check and reset billing cycle if expired, then return the fresh key.
   * Returns undefined if key not found.
   */
  async checkAndResetCycle(keyId: string): Promise<AgentKey | undefined> {
    let agentKey = dbGetAgentKey(keyId);
    if (!agentKey) return undefined;

    if (isBillingCycleExpired(agentKey.billingCycleStart, config.freeTier.monthlyWindowMs)) {
      await resetAgentKeyUsage(keyId);
      agentKey = dbGetAgentKey(keyId);
    }

    return agentKey;
  }
}