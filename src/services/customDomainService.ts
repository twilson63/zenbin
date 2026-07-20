import { randomBytes, createHash } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';
import { isIP } from 'node:net';
import { domainToASCII } from 'node:url';
import { getPublicSuffix } from 'tldts';
import {
  createCustomDomain,
  deleteCustomDomain,
  getActiveCustomDomain,
  getCustomDomain,
  listCustomDomainsBySubdomain,
  updateCustomDomain,
} from '../storage/db.js';
import { config } from '../config.js';
import type { CustomDomain } from '../types.js';

export type CertificateStatus = 'pending' | 'active' | 'failed';

export interface CustomHostnameProvider {
  create(hostname: string): Promise<{ id: string; certificateStatus: CertificateStatus; errorCode?: string; errorDetail?: string }>;
  status(providerHostnameId: string): Promise<{ certificateStatus: CertificateStatus; errorCode?: string; errorDetail?: string }>;
  delete(providerHostnameId: string): Promise<void>;
}

export interface DnsResolver {
  lookupTxt(name: string): Promise<string[]>;
}

export class SystemDnsResolver implements DnsResolver {
  async lookupTxt(name: string): Promise<string[]> {
    const records = await resolveTxt(name);
    return records.map((segments) => segments.join(''));
  }
}

/** Safe default: no hostname can become routable until an edge provider is configured. */
export class UnconfiguredCustomHostnameProvider implements CustomHostnameProvider {
  async create(): Promise<{ id: string; certificateStatus: CertificateStatus }> {
    throw new Error('No managed custom-hostname provider is configured');
  }

  async status(): Promise<{ certificateStatus: CertificateStatus }> {
    throw new Error('No managed custom-hostname provider is configured');
  }

  async delete(): Promise<void> {
    throw new Error('No managed custom-hostname provider is configured');
  }
}

export function normalizeCustomHostname(input: string): string | null {
  const raw = input.trim().replace(/\.$/, '').toLowerCase();
  if (!raw || raw.length > 253 || raw.includes('*') || raw === 'localhost' || isIP(raw)) return null;
  const hostname = domainToASCII(raw);
  if (!hostname || hostname.length > 253 || !hostname.includes('.') || hostname.endsWith('.')) return null;
  if (hostname === config.subdomains.baseDomain || hostname.endsWith(`.${config.subdomains.baseDomain}`)) return null;
  const labels = hostname.split('.');
  if (labels.length < 2 || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  if (labels.length === 1 || labels[labels.length - 1].length < 2 || getPublicSuffix(hostname) === hostname) return null;
  return hostname;
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function sanitizedProviderDetail(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Managed hostname provider failed';
  return message.replace(/[\r\n]/g, ' ').slice(0, 240);
}

export interface CustomDomainServiceOptions {
  dns?: DnsResolver;
  provider?: CustomHostnameProvider;
}

export class CustomDomainService {
  private readonly dns: DnsResolver;
  private readonly provider: CustomHostnameProvider;

  constructor(options: CustomDomainServiceOptions = {}) {
    this.dns = options.dns ?? new SystemDnsResolver();
    this.provider = options.provider ?? new UnconfiguredCustomHostnameProvider();
  }

  create(hostnameInput: string, subdomain: string, ownerKeyId: string): { domain?: CustomDomain; conflict: boolean; invalid: boolean } {
    const hostname = normalizeCustomHostname(hostnameInput);
    if (!hostname) return { conflict: false, invalid: true };

    const verificationToken = randomBytes(32).toString('base64url');
    const result = createCustomDomain({
      hostname,
      subdomain,
      ownerKeyId,
      verificationToken,
      verificationTokenHash: tokenHash(verificationToken),
    });
    return { domain: result.domain, conflict: !result.created, invalid: false };
  }

  get(hostname: string): CustomDomain | undefined {
    return getCustomDomain(hostname);
  }

  list(subdomain: string): CustomDomain[] {
    return listCustomDomainsBySubdomain(subdomain);
  }

  getActiveForHost(host: string): CustomDomain | undefined {
    const normalized = normalizeCustomHostname(host);
    return normalized ? getActiveCustomDomain(normalized) : undefined;
  }

  async verify(hostname: string): Promise<{ domain: CustomDomain; errorCode?: string }> {
    const domain = getCustomDomain(hostname);
    if (!domain) throw new Error('Custom domain not found');
    if (domain.lifecycleStatus === 'active') return { domain };
    if (domain.lifecycleStatus === 'deleting') return { domain, errorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR' };

    if (domain.verificationStatus !== 'verified') {
      const expected = domain.verificationToken ? `zenbin-verification=${domain.verificationToken}` : '';
      try {
        const records = await this.dns.lookupTxt(`_zenbin-verification.${domain.hostname}`);
        if (!expected || !records.includes(expected)) {
          const updated = updateCustomDomain(domain.hostname, {
            lifecycleStatus: 'pending_dns', verificationStatus: 'failed', lastErrorCode: 'CUSTOM_DOMAIN_DNS_MISMATCH', lastErrorDetail: 'The required TXT record was not found.',
          });
          return { domain: updated!, errorCode: 'CUSTOM_DOMAIN_DNS_MISMATCH' };
        }
      } catch {
        const updated = updateCustomDomain(domain.hostname, {
          lifecycleStatus: 'pending_dns', verificationStatus: 'failed', lastErrorCode: 'CUSTOM_DOMAIN_DNS_MISMATCH', lastErrorDetail: 'The required TXT record could not be resolved.',
        });
        return { domain: updated!, errorCode: 'CUSTOM_DOMAIN_DNS_MISMATCH' };
      }
    }

    let current = getCustomDomain(domain.hostname)!;
    if (!current.providerHostnameId) {
      try {
        const created = await this.provider.create(current.hostname);
        current = updateCustomDomain(current.hostname, {
          verificationStatus: 'verified', verificationToken: undefined, provider: config.customDomains.provider, providerHostnameId: created.id,
          certificateStatus: created.certificateStatus,
          lifecycleStatus: created.certificateStatus === 'active' ? 'active' : 'provisioning',
          lastErrorCode: created.errorCode, lastErrorDetail: created.errorDetail,
          verifiedAt: new Date().toISOString(), activatedAt: created.certificateStatus === 'active' ? new Date().toISOString() : undefined,
        })!;
      } catch (error) {
        current = updateCustomDomain(current.hostname, {
          lifecycleStatus: 'error', verificationStatus: 'verified', certificateStatus: 'failed', lastErrorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR', lastErrorDetail: sanitizedProviderDetail(error),
        })!;
        return { domain: current, errorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR' };
      }
    } else {
      try {
        const status = await this.provider.status(current.providerHostnameId);
        current = updateCustomDomain(current.hostname, {
          certificateStatus: status.certificateStatus,
          lifecycleStatus: status.certificateStatus === 'active' ? 'active' : status.certificateStatus === 'failed' ? 'error' : 'provisioning',
          lastErrorCode: status.errorCode, lastErrorDetail: status.errorDetail,
          activatedAt: status.certificateStatus === 'active' ? new Date().toISOString() : current.activatedAt,
        })!;
        if (status.certificateStatus === 'failed') return { domain: current, errorCode: 'CUSTOM_DOMAIN_CERT_PENDING' };
      } catch (error) {
        current = updateCustomDomain(current.hostname, { lifecycleStatus: 'error', lastErrorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR', lastErrorDetail: sanitizedProviderDetail(error) })!;
        return { domain: current, errorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR' };
      }
    }

    return { domain: current, errorCode: current.lifecycleStatus === 'active' ? undefined : 'CUSTOM_DOMAIN_CERT_PENDING' };
  }

  setPrimary(hostname: string, primary: boolean): CustomDomain | undefined {
    const current = getCustomDomain(hostname);
    if (!current) return undefined;
    if (!primary) return updateCustomDomain(hostname, { primaryDomain: false });
    for (const sibling of listCustomDomainsBySubdomain(current.subdomain)) {
      if (sibling.primaryDomain && sibling.hostname !== hostname) updateCustomDomain(sibling.hostname, { primaryDomain: false });
    }
    return updateCustomDomain(hostname, { primaryDomain: true });
  }

  async delete(hostname: string): Promise<{ domain?: CustomDomain; errorCode?: string }> {
    const domain = getCustomDomain(hostname);
    if (!domain) return {};
    let current = updateCustomDomain(hostname, { lifecycleStatus: 'deleting' })!;
    if (current.providerHostnameId) {
      try {
        await this.provider.delete(current.providerHostnameId);
      } catch (error) {
        current = updateCustomDomain(hostname, { lastErrorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR', lastErrorDetail: sanitizedProviderDetail(error) })!;
        return { domain: current, errorCode: 'CUSTOM_DOMAIN_PROVIDER_ERROR' };
      }
    }
    deleteCustomDomain(hostname);
    return { domain: current };
  }

  async deleteAllForSubdomain(subdomain: string): Promise<{ errorCode?: string }> {
    for (const domain of listCustomDomainsBySubdomain(subdomain)) {
      const result = await this.delete(domain.hostname);
      if (result.errorCode) return { errorCode: result.errorCode };
    }
    return {};
  }
}

/** Used by request routing without instantiating a provider or performing DNS. */
export function resolveCustomDomainHost(host: string): CustomDomain | undefined {
  const normalized = normalizeCustomHostname(host);
  return normalized ? getActiveCustomDomain(normalized) : undefined;
}
