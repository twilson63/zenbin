/**
 * AuditService — wraps audit log storage operations
 */

import { saveAuditLog as dbSaveAuditLog, listAuditLogsForKey as dbListAuditLogsForKey } from '../storage/db.js';
import type { AuditLogRecord } from '../types.js';
import type { IAuditService } from './interfaces.js';

export class AuditService implements IAuditService {
  async save(record: Omit<AuditLogRecord, 'id' | 'created_at'>): Promise<AuditLogRecord> {
    return dbSaveAuditLog(record);
  }

  listForKey(keyId: string): AuditLogRecord[] {
    return dbListAuditLogsForKey(keyId);
  }
}