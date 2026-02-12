# 🌐 Production Deployment Guide (VPS + NGINX)

This guide helps you deploy your n8n instance and expense tracker to a VPS with NGINX as a reverse proxy.

## 🎯 Architecture Overview

```
Internet
    ↓
[NGINX Reverse Proxy]
    ↓ (SSL/TLS, CORS, Rate Limiting)
    ├─→ expense.khawarizmi.space → Vercel (Frontend)
    └─→ n8n.khawarizmi.space → VPS (n8n Backend)
```

---

## Part 1: VPS Setup

### 1.1 Server Requirements

- **OS**: Ubuntu 22.04 LTS (recommended)
- **RAM**: Minimum 2GB
- **Storage**: 20GB SSD
- **CPU**: 1+ cores

### 1.2 Initial Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx ufw

# Enable Docker
systemctl enable docker
systemctl start docker

# Configure Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Part 2: Deploy n8n with Docker

### 2.1 Create n8n Directory

```bash
mkdir -p /opt/n8n
cd /opt/n8n
```

### 2.2 Create Docker Compose File

Create `/opt/n8n/docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"  # Only accessible from localhost
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password-here  # CHANGE THIS!
      - N8N_HOST=n8n.khawarizmi.space
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.khawarizmi.space/
      - GENERIC_TIMEZONE=Asia/Kuala_Lumpur  # Adjust to your timezone
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    driver: local
```

### 2.3 Start n8n

```bash
cd /opt/n8n
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Part 3: DNS Configuration

### 3.1 Add DNS Records

In your domain registrar (for `khawarizmi.space`):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | n8n | `your-vps-ip` | 300 |

Wait 5-10 minutes for DNS propagation.

### 3.2 Verify DNS

```bash
# Check if DNS is resolving
dig n8n.khawarizmi.space

# Or use nslookup
nslookup n8n.khawarizmi.space
```

---

## Part 4: NGINX Configuration

### 4.1 Create n8n NGINX Config

Create `/etc/nginx/sites-available/n8n.khawarizmi.space`:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=n8n_limit:10m rate=10r/s;

# Upstream to n8n
upstream n8n_backend {
    server 127.0.0.1:5678;
    keepalive 32;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name n8n.khawarizmi.space;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name n8n.khawarizmi.space;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/n8n.khawarizmi.space/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/n8n.khawarizmi.space/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # CORS Headers for API endpoints
    add_header Access-Control-Allow-Origin "https://expense.khawarizmi.space" always;
    add_header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, X-API-Key, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Handle preflight requests
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin "https://expense.khawarizmi.space" always;
        add_header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, X-API-Key, Authorization" always;
        add_header Access-Control-Max-Age "3600" always;
        add_header Content-Length "0" always;
        add_header Content-Type "text/plain" always;
        return 204;
    }

    # Client body size
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

    # Logging
    access_log /var/log/nginx/n8n_access.log;
    error_log /var/log/nginx/n8n_error.log;

    # Webhook endpoints (rate limited)
    location /webhook {
        # Apply rate limiting
        limit_req zone=n8n_limit burst=20 nodelay;

        # Proxy to n8n
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Disable buffering for webhooks
        proxy_buffering off;
        proxy_cache off;
    }

    # n8n Editor (protected with basic auth)
    location / {
        # Proxy to n8n
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_buffering off;
    }
}
```

### 4.2 Enable Site & Test Configuration

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/n8n.khawarizmi.space /etc/nginx/sites-enabled/

# Test NGINX configuration
nginx -t

# Reload NGINX
systemctl reload nginx
```

---

## Part 5: SSL Certificate with Let's Encrypt

### 5.1 Obtain SSL Certificate

```bash
# Get certificate for n8n subdomain
certbot --nginx -d n8n.khawarizmi.space

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

### 5.2 Auto-Renewal Setup

```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically sets up a cron job
# Verify it's scheduled:
systemctl list-timers | grep certbot
```

---

## Part 6: Update Frontend Configuration

### 6.1 Update Vercel Environment Variables

In your Vercel dashboard (expense.khawarizmi.space):

1. Go to **Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_N8N_BASE_URL = https://n8n.khawarizmi.space
   VITE_API_KEY = your-production-api-key
   VITE_STORAGE_MODE = api
   ```
3. **Redeploy** your application

### 6.2 Update Local `.env.production`

```env
VITE_N8N_BASE_URL=https://n8n.khawarizmi.space
VITE_API_KEY=your-production-api-key
VITE_STORAGE_MODE=api
```

---

## Part 7: Security Best Practices

### 7.1 Firewall Rules

```bash
# Only allow necessary ports
ufw status

# Should show:
# 22/tcp (SSH)
# 80/tcp (HTTP - for Let's Encrypt)
# 443/tcp (HTTPS)

# Block direct access to n8n port
ufw deny 5678
```

### 7.2 Generate Strong API Key

```bash
# Generate a secure API key
openssl rand -hex 32

# Use this in:
# 1. n8n webhook authentication
# 2. Frontend .env files
```

### 7.3 Regular Updates

```bash
# Create update script
cat > /root/update-n8n.sh << 'EOF'
#!/bin/bash
cd /opt/n8n
docker-compose pull
docker-compose up -d
docker system prune -f
EOF

chmod +x /root/update-n8n.sh

# Add to crontab (weekly updates)
crontab -e
# Add: 0 3 * * 0 /root/update-n8n.sh
```

---

## Part 8: Monitoring & Maintenance

### 8.1 Check n8n Status

```bash
# Check container status
docker ps | grep n8n

# View logs
docker logs -f n8n --tail 100

# Check resource usage
docker stats n8n
```

### 8.2 NGINX Logs

```bash
# Access logs
tail -f /var/log/nginx/n8n_access.log

# Error logs
tail -f /var/log/nginx/n8n_error.log

# Find failed requests
grep " 5[0-9][0-9] " /var/log/nginx/n8n_error.log
```

### 8.3 Setup Log Rotation

NGINX logs rotate automatically. For n8n:

```bash
# Docker handles log rotation automatically
# But you can configure it in docker-compose.yml:

# Add to n8n service:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Part 9: Backup Strategy

### 9.1 Backup n8n Data

```bash
# Create backup script
cat > /root/backup-n8n.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/n8n"
mkdir -p $BACKUP_DIR

# Backup n8n data volume
docker run --rm -v n8n_n8n_data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/n8n-data-$(date +%Y%m%d).tar.gz -C /data .

# Keep only last 7 backups
find $BACKUP_DIR -name "n8n-data-*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup-n8n.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /root/backup-n8n.sh
```

### 9.2 Restore from Backup

```bash
# Stop n8n
cd /opt/n8n
docker-compose down

# Restore data
docker run --rm -v n8n_n8n_data:/data -v /root/backups/n8n:/backup \
  alpine sh -c "cd /data && tar xzf /backup/n8n-data-YYYYMMDD.tar.gz"

# Start n8n
docker-compose up -d
```

---

## Part 10: Troubleshooting

### Common Issues

#### 1. **502 Bad Gateway**
```bash
# Check if n8n is running
docker ps | grep n8n

# Check n8n logs
docker logs n8n

# Restart n8n
docker-compose restart
```

#### 2. **SSL Certificate Issues**
```bash
# Renew certificate manually
certbot renew --force-renewal

# Check certificate expiry
certbot certificates
```

#### 3. **CORS Errors**
- Verify `Access-Control-Allow-Origin` in NGINX config matches your frontend domain
- Check browser console for specific CORS error
- Test with `curl -I` to see response headers

#### 4. **Rate Limiting Triggered**
```bash
# Check NGINX error logs
grep "limiting requests" /var/log/nginx/n8n_error.log

# Adjust rate in NGINX config if needed
# limit_req_zone ... rate=20r/s;  # Increase from 10r/s
```

---

## 🎉 Deployment Checklist

- [ ] VPS setup complete
- [ ] Docker & n8n running
- [ ] DNS configured for n8n.khawarizmi.space
- [ ] NGINX installed and configured
- [ ] SSL certificate obtained
- [ ] Firewall rules applied
- [ ] API key generated and configured
- [ ] Frontend environment variables updated
- [ ] Vercel redeployed with new env vars
- [ ] Backup script scheduled
- [ ] Update script scheduled
- [ ] Test all CRUD operations
- [ ] Monitor logs for 24 hours

---

## 📊 Performance Optimization (Optional)

### Enable NGINX Caching for Static Assets

Add to your NGINX config:

```nginx
# Cache zone definition (add at top)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=n8n_cache:10m inactive=60m;

# In location block:
location /static/ {
    proxy_cache n8n_cache;
    proxy_cache_valid 200 1h;
    proxy_pass http://n8n_backend;
}
```

---

## 🆘 Support

If you encounter issues:
1. Check n8n logs: `docker logs n8n`
2. Check NGINX logs: `tail -f /var/log/nginx/n8n_error.log`
3. Test endpoints with curl:
   ```bash
   curl -H "X-API-Key: your-key" https://n8n.khawarizmi.space/webhook/months
   ```

Good luck with your production deployment! 🚀
