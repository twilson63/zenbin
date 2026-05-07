/**
 * NonceService — wraps nonce storage operations
 */

import { registerUsedNonce as dbRegisterUsedNonce } from '../storage/db.js';
import type { INonceService } from './interfaces.js';

export class NonceService implements INonceService {
  async register(keyId: string, nonce: string, expiresAt: string): Promise<boolean> {
    return dbRegisterUsedNonce(keyId, nonce, expiresAt);
  }
}