#!/bin/bash
# ZenBin - DigitalOcean droplet setup script
# Run this once on a fresh Ubuntu 24.04 droplet
set -e

echo "🔧 Setting up ZenBin server..."

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 22 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Verify Node.js
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Create data directories
mkdir -p /var/data/zenbin.lmdb
mkdir -p /var/data/videos
mkdir -p /opt/zenbin

# Create systemd service
cat > /etc/systemd/system/zenbin.service << 'EOF'
[Unit]
Description=ZenBin Publishing API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/zenbin
ExecStart=/usr/bin/node -r dotenv/config dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable zenbin

# Install nginx for reverse proxy
apt-get install -y nginx certbot python3-certbot-nginx

# Configure nginx
cat > /etc/nginx/sites-available/zenbin << 'EOF'
server {
    listen 80;
    server_name zenbin.org *.zenbin.org;

    location / {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Video streaming support
        proxy_buffering off;
        proxy_request_buffering off;

        # Large payload support (5MB)
        client_max_body_size 5M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/zenbin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Point DNS: zenbin.org and *.zenbin.org → $(curl -s ifconfig.me)"
echo "2. Deploy via GitHub Actions or manually: scp -r dist/ package.json package-lock.json public/ root@$(curl -s ifconfig.me):/opt/zenbin/"
echo "3. Create .env on server with your secrets"
echo "4. Run: cd /opt/zenbin && npm ci --omit=dev && systemctl start zenbin"
echo "5. Add SSL: certbot --nginx -d zenbin.org -d '*.zenbin.org'"