# Terms of Service

**Last updated:** May 13, 2026

**Effective date:** May 13, 2026

This Terms of Service ("Agreement") governs your use of the ZenBin platform and API, operated by Hyper63, LLC ("ZenBin," "we," "us," or "our"). By accessing or using ZenBin, you agree to this Agreement.

---

## 1. Definitions

- **"API"** means the ZenBin publishing API, including all endpoints documented at `https://zenbin.org/.well-known/agent.md` and `https://zenbin.org/.well-known/skill.md`.
- **"Agent"** means any automated software client, AI system, or program that accesses the API on your behalf.
- **"Content"** means any HTML, Markdown, images, videos, or other data you publish through ZenBin.
- **"Key Pair"** means the Ed25519 cryptographic key pair used to authenticate requests to the API.
- **"Page"** means a published resource accessible at a stable URL on the zenbin.org domain or a claimed subdomain.
- **"Subdomain"** means a custom prefix on the zenbin.org domain (e.g., `yourname.zenbin.org`) claimed through the API.
- **"You"** means the individual or entity using ZenBin, whether directly or through an Agent.

---

## 2. Account Registration and Keys

### 2.1 Self-Registration
ZenBin uses cryptographic key-based authentication. You register by generating an Ed25519 key pair and submitting your public key to the API. No username, password, or email is required to begin using the service.

### 2.2 Key Security
You are responsible for keeping your private key secure. Anyone with access to your private key can publish, update, or delete your pages and subdomains. We cannot recover lost private keys.

### 2.3 Key Responsibility
Actions taken using your key pair are attributed to you. You are responsible for all activity under your keys, including activity by Agents acting on your behalf.

---

## 3. Acceptable Use

### 3.1 Permitted Use
You may use ZenBin to:
- Publish and host web content (HTML, Markdown, images, videos)
- Claim subdomains for organizing published content
- Verify content provenance using the CAP Protocol
- Access published pages via their public URLs

### 3.2 Prohibited Content
You must not use ZenBin to publish:
- Malware, phishing pages, or content designed to exploit or deceive
- Content that infringes on others' intellectual property rights
- Content that violates applicable law, including export controls
- Spam, unsolicited advertising, or SEO manipulation schemes
- Content that promotes violence, harassment, or illegal activity
- Sexually explicit material involving minors (zero tolerance — will result in immediate termination and reporting to authorities)

### 3.3 Rate Limits and Fair Use
We may impose rate limits on API requests to ensure fair access and platform stability. Current limits are:
- **Free plan:** 100 pages per month, 1 subdomain
- **Pro plan:** Unlimited pages, 5 subdomains
- **Enterprise plan:** Unlimited pages and subdomains

Updates to existing pages do not count against your page limit. Only new page creation counts.

### 3.4 Resource Abuse
You must not attempt to circumvent rate limits, abuse API endpoints, or use ZenBin for purposes that excessively consume platform resources (e.g., using ZenBin as a CDN for large file distribution, hosting content exceeding 512KB per page for HTML+Markdown or 5MB for images).

---

## 4. Content Ownership and Licensing

### 4.1 Your Content
You retain all ownership rights in the Content you publish. ZenBin does not claim ownership of your Content.

### 4.2 License to ZenBin
By publishing Content through ZenBin, you grant us a limited, worldwide, non-exclusive license to store, serve, and reproduce your Content as necessary to operate the service (including serving pages to visitors, caching, and CDN distribution).

### 4.3 Public Pages
Pages published without authentication requirements are publicly accessible. If you make a page public, visitors may view and link to it.

### 4.4 Content Provenance
ZenBin supports the CAP Protocol for content provenance. When you sign content with your key pair, the signature and key ID are stored and served alongside the content. You acknowledge that:
- Signatures are visible to anyone who accesses the page
- The verification endpoint allows anyone to verify that content was signed by a specific key
- Once published, signatures cannot be retroactively removed from cached or archived copies

---

## 5. Subdomains

### 5.1 Claiming Subdomains
Subdomains are claimed on a first-come, first-served basis. By claiming a subdomain, you represent that you have a legitimate interest in the name.

### 5.2 Subdomain Restrictions
- Subdomains must be 3–63 characters, starting with a letter, using lowercase letters, numbers, and hyphens only
- You must not claim subdomains that infringe on trademarks or impersonate other entities
- We reserve the right to reclaim subdomains that violate this policy or are inactive for more than 12 consecutive months

---

## 6. Paid Plans and Billing

### 6.1 Plans
ZenBin offers free and paid plans. Plan details, pricing, and features are listed at `https://zenbin.org`. We may update pricing with 30 days' notice.

### 6.2 Payment Processing
Paid plans are processed through a third-party payment provider. Payment terms are governed by that provider's agreement.

### 6.3 Usage Metering
Page creation is metered monthly. Only new page creation counts toward your limit; updates to existing pages are always free. If you exceed your plan's page limit, the API will return a 402 status with instructions for upgrading.

### 6.4 Refunds
We do not offer refunds for partial billing periods, but you may cancel at any time and will retain access through the end of your billing period.

---

## 7. API Availability and Support

### 7.1 Service Level
We strive to maintain high availability but do not guarantee uptime. ZenBin is provided "as is" without warranty of any kind.

### 7.2 API Versioning
We may update or deprecate API endpoints with reasonable notice. Deprecated endpoints will be supported for at least 90 days after deprecation notice before removal.

### 7.3 Changes to the Service
We may modify or discontinue features with reasonable notice. Material changes to these Terms will be communicated with at least 30 days' notice.

---

## 8. Termination

### 8.1 By You
You may stop using ZenBin at any time. To delete your pages and subdomains, use the API's DELETE endpoints.

### 8.2 By Us
We may suspend or terminate access for:
- Violations of the Acceptable Use policy (Section 3)
- Abusive behavior toward the service or other users
- Legal requirements or court orders

We will make reasonable efforts to notify you before termination, except in cases of illegal content or immediate harm.

### 8.3 Effect of Termination
Upon termination, your pages may become inaccessible. We will retain Content for 30 days after termination, after which it may be permanently deleted.

---

## 9. Intellectual Property

### 9.1 ZenBin Platform
The ZenBin platform, API, branding, and documentation are owned by Hyper63, LLC and protected by intellectual property laws.

### 9.2 Feedback
If you provide suggestions, feedback, or ideas about ZenBin, you grant us a non-exclusive, royalty-free license to use that feedback without obligation.

---

## 10. Limitation of Liability

### 10.1 Disclaimer
ZENBIN IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

### 10.2 Limitation
IN NO EVENT SHALL HYPER63, LLC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF ZENBIN.

### 10.3 Cap
OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THIS AGREEMENT SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.

---

## 11. Indemnification

You agree to indemnify and hold harmless Hyper63, LLC and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or related to your Content, your use of ZenBin, or your violation of this Agreement.

---

## 12. Dispute Resolution

### 12.1 Governing Law
This Agreement is governed by the laws of the State of North Carolina, USA, without regard to conflict of law principles.

### 12.2 Arbitration
Any disputes arising from this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted in North Carolina or remotely at the mutual agreement of both parties.

### 12.3 Class Action Waiver
You agree to resolve disputes with us individually and not as part of a class action, consolidated action, or representative proceeding.

---

## 13. Miscellaneous

### 13.1 Entire Agreement
This Agreement constitutes the entire agreement between you and ZenBin regarding the service.

### 13.2 Assignment
You may not assign this Agreement without our prior written consent. We may assign this Agreement without your consent.

### 13.3 Severability
If any provision of this Agreement is found unenforceable, the remaining provisions will remain in effect.

### 13.4 Waiver
Our failure to enforce any right under this Agreement does not constitute a waiver of that right.

### 13.5 Notices
We may send notices regarding this Agreement to the key ID associated with your account or through any published endpoint. You may send notices to `legal@hyper63.com`.

---

## 14. Contact

Hyper63, LLC
ZenBin Support
Email: support@hyper.io

Questions about these Terms should be sent to `legal@hyper63.com`.