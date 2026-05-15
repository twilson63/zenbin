/**
 * KeyService — wraps agent key storage operations
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
import type { AgentKey, Plan } from '../types.js';
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
}