/**
 * Service Container — dependency injection for all services
 *
 * Create once at app startup, pass into route handlers.
 * Services can be swapped for testing.
 */

import { PageService } from './pageService.js';
import { SubdomainService } from './subdomainService.js';
import { KeyService } from './keyService.js';
import { NonceService } from './nonceService.js';
import { AuditService } from './auditService.js';
import { VideoService } from './videoService.js';
import { CustomDomainService } from './customDomainService.js';
import { billingService } from './billingService.js';
import type {
  IPageService,
  ISubdomainService,
  IKeyService,
  INonceService,
  IAuditService,
  IVideoService,
  ICustomDomainService,
  IBillingService,
} from './interfaces.js';

export interface Services {
  pages: IPageService;
  subdomains: ISubdomainService;
  keys: IKeyService;
  nonces: INonceService;
  audit: IAuditService;
  videos: IVideoService;
  domains: ICustomDomainService;
  billing: IBillingService;
}

export function createServices(): Services {
  return {
    pages: new PageService(),
    subdomains: new SubdomainService(),
    keys: new KeyService(),
    nonces: new NonceService(),
    audit: new AuditService(),
    videos: new VideoService(),
    domains: new CustomDomainService(),
    billing: billingService,
  };
}