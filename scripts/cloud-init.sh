#!/bin/bash
# ZenBin server setup - runs via cloud-init on first boot
set -e

# Wait for apt lock
while fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do sleep 2; done

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Install nginx and certbot
apt-get install -y nginx certbot python3-certbot-nginx

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

# Configure nginx reverse proxy
cat > /etc/nginx/sites-available/zenbin << 'EOF'
server {
    listen 80;
    server_name zenbin.org *.zenbin.org;

    client_max_body_size 5M;

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
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/zenbin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

# Configure firewall
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Create deploy user for GitHub Actions
useradd -m -s /bin/bash deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true

# Give deploy user sudo access for restarts
echo 'deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart zenbin, /usr/bin/systemctl status zenbin' > /etc/sudoers.d/deploy

# Write completion marker
echo "ZenBin setup completed at $(date)" > /opt/zenbin/.setup-complete

echo "=== ZenBin server setup complete ==="