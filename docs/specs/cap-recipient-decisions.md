# CAP Protocol Recipient — Design Decisions

Grilling session decisions baked into the spec:

1. **`recipient=me`** — magic value, resolves to authenticated keyId. No querying other keys' directed pages in v1.
2. **`recipientKeyId` is routing metadata, not access control** — pages are still public by URL. The field controls feed visibility, not resource access.
3. **No server-side read tracking** — agents use `since` timestamps client-side. No `PageReadStatus` type, no `/read` or `/unread` endpoints, no `unread_count`.
4. **`recipientKeyId` not validated against key store** — you can address a key that hasn't been registered yet. Routing, not verification.
5. **Changing `recipientKeyId` updates the index** — old entry removed, new one created. Old recipient loses visibility in their feed.
6. **`since` is inclusive** — `created_at >= since`. Agents deduplicate by page ID if needed.
7. **`since` works on both owner and recipient queries** — general time filtering on `GET /v1/pages`.
8. **Recipient queries are global across subdomains** — `?recipient=me` returns all pages directed at you, regardless of subdomain. Each item includes its `subdomain` field.
9. **`recipientKeyId` visible to all readers** — anyone who can see the page can see who it's addressed to. Like email's "To:" header.
10. **No `recipientKeyId` in canonical request for signature verification** — signature covers content integrity and author identity. Recipient is routing metadata.
11. **`recipientKeyId` not in verify endpoint** — verify proves signatures, not routing metadata. Look up `recipientKeyId` in page metadata if you need it.
12. **Cursor and `since` are orthogonal** — client passes `since` on every paginated request along with cursor.
13. **Auto-mark-as-read removed** — client tracks read state. No server-side read tracking at all.
14. **Inbox spec preserved as fallback** — `docs/specs/inbox-v1.md` and `inbox-architecture.md` kept if we need to pivot.