# ZenBin DigitalOcean Deployment

## Droplet Info

- **IP:** 147.182.179.148
- **Region:** nyc1
- **Size:** s-1vcpu-1gb ($6/mo)
- **Image:** Ubuntu 24.04 LTS
- **Backups:** Enabled
- **Tags:** zenbin, production

## SSH Keys

Two deploy keys are registered in DO:
1. `github-actions-zenbin` (Ed25519) — for GitHub Actions
2. `github-actions-zenbin-rsa` (RSA 4096) — fallback

Private key is in `.deploy-key` (add to GitHub Secrets as `DO_SSH_KEY`).

## Cloud-Init Setup

The droplet boots with `scripts/cloud-init.sh` which:
- Installs Node.js 22, nginx, certbot
- Creates `/var/data/zenbin.lmdb` and `/var/data/videos`
- Creates systemd service for ZenBin
- Configures nginx reverse proxy on port 80
- Sets up UFW firewall (SSH + Nginx Full)

## GitHub Actions Deployment

`.github/workflows/deploy.yml` triggers on push to `main`:
1. Checkout, build, test
2. Create `.env` file with secrets
3. SCP `dist/`, `package.json`, `package-lock.json`, `public/`, `.env` to `/opt/zenbin`
4. SSH: `npm ci --omit=dev` + `systemctl restart zenbin`
5. Health check

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `DO_HOST` | `147.182.179.148` |
| `DO_SSH_KEY` | Contents of `.deploy-key` (RSA private key) |
| `ZENBIN_JWT_SECRET` | (your JWT secret) |
| `ADMIN_TOKEN` | (your admin token) |

## DNS Setup

Point these records to `147.182.179.148`:
- `zenbin.org` → A record → 147.182.179.148
- `*.zenbin.org` → A record → 147.182.179.148

## SSL (after DNS propagates)

```bash
ssh root@147.182.179.148
certbot --nginx -d zenbin.org -d '*.zenbin.org'
```

## Manual Deploy (first time)

```bash
# SSH into the server
ssh root@147.182.179.148

# Check cloud-init finished
cat /opt/zenbin/.setup-complete

# If cloud-init is still running:
cloud-init status --wait

# Deploy the app
cd /opt/zenbin
npm ci --omit=dev
systemctl start zenbin
systemctl status zenbin
```

## Useful Commands

```bash
# Check app logs
journalctl -u zenbin -f

# Restart app
systemctl restart zenbin

# Check nginx
nginx -t && systemctl restart nginx

# Check firewall
ufw status
```