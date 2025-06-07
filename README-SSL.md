# NOC Monitoring Dashboard - SSL Configuration

This guide explains how to configure SSL/HTTPS for your NOC Monitoring Dashboard using your custom SSL certificates.

## Prerequisites

- Your SSL certificates (`ca-umm.crt` and `umm.key`) placed in the `certs/` directory
- Docker and Docker Compose installed
- Domain `dev-suhu.umm.ac.id` pointing to your server
- Ports 80 and 443 open in your firewall

## SSL Certificate Setup

1. **Place your SSL certificates in the `certs/` directory:**
   ```
   certs/
   ├── ca-umm.crt    # Your SSL certificate
   └── umm.key       # Your private key
   ```

2. **Set proper permissions:**
   ```bash
   chmod 600 certs/umm.key
   chmod 644 certs/ca-umm.crt
   ```

## Quick Setup

Run the automated setup script:

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

This script will:
- Validate your SSL certificates
- Create necessary directories
- Set proper permissions
- Build and start the SSL-enabled services
- Perform health checks

## Manual Setup

If you prefer manual setup:

1. **Copy the SSL environment file:**
   ```bash
   cp .env.ssl .env
   ```

2. **Review and update the `.env` file:**
   ```bash
   nano .env
   ```

3. **Build and start services:**
   ```bash
   docker-compose -f docker-compose-ssl.yml build
   docker-compose -f docker-compose-ssl.yml up -d
   ```

## Configuration Files

### SSL-Enabled Files

- `nginx-ssl.conf` - Nginx configuration with SSL support
- `server-ssl.js` - Backend server with HTTPS support
- `docker-compose-ssl.yml` - Docker Compose with SSL configuration
- `Dockerfile.ssl` - Frontend Dockerfile with SSL support
- `backend/Dockerfile.ssl` - Backend Dockerfile with SSL support

### Key Features

- **HTTPS Enforcement**: All HTTP traffic redirected to HTTPS
- **Security Headers**: HSTS, CSP, and other security headers
- **SSL Optimization**: Modern SSL/TLS configuration
- **WebSocket Support**: Secure WebSocket connections
- **Health Checks**: SSL-aware health monitoring

## Service URLs

After setup, your services will be available at:

- **Main Dashboard**: https://dev-suhu.umm.ac.id
- **Backend API**: https://dev-suhu.umm.ac.id/api/
- **WebSocket**: wss://dev-suhu.umm.ac.id/socket.io/

## Security Features

### SSL/TLS Configuration

- **Protocols**: TLS 1.2 and 1.3 only
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: HTTP Strict Transport Security enabled
- **Session Management**: Optimized SSL session handling

### Security Headers

- `Strict-Transport-Security`: Force HTTPS for 1 year
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Content-Security-Policy`: Restrict resource loading
- `Referrer-Policy`: Control referrer information

### Backend Security

- **HTTPS Only**: Backend only accepts HTTPS connections
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Properly configured for HTTPS origin
- **Input Validation**: All inputs validated and sanitized

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose-ssl.yml logs -f

# Frontend only
docker-compose -f docker-compose-ssl.yml logs -f noc-monitoring-frontend

# Backend only
docker-compose -f docker-compose-ssl.yml logs -f noc-monitoring-backend
```

### Log Files

- Nginx logs: `logs/nginx/`
- Backend logs: `logs/backend/`

### Health Checks

```bash
# Backend health
curl -k https://localhost:3001/api/health

# Frontend health
curl -k https://localhost/
```

## Troubleshooting

### Common Issues

1. **Certificate Validation Errors**
   ```bash
   # Check certificate validity
   openssl x509 -in certs/ca-umm.crt -text -noout
   
   # Verify private key matches certificate
   openssl x509 -noout -modulus -in certs/ca-umm.crt | openssl md5
   openssl rsa -noout -modulus -in certs/umm.key | openssl md5
   ```

2. **Permission Issues**
   ```bash
   # Fix certificate permissions
   sudo chown $USER:$USER certs/*
   chmod 600 certs/umm.key
   chmod 644 certs/ca-umm.crt
   ```

3. **Port Conflicts**
   ```bash
   # Check if ports are in use
   sudo netstat -tlnp | grep :443
   sudo netstat -tlnp | grep :80
   ```

4. **DNS Issues**
   ```bash
   # Test domain resolution
   nslookup dev-suhu.umm.ac.id
   
   # Test local access
   echo "127.0.0.1 dev-suhu.umm.ac.id" | sudo tee -a /etc/hosts
   ```

### Service Management

```bash
# Stop services
docker-compose -f docker-compose-ssl.yml down

# Restart services
docker-compose -f docker-compose-ssl.yml restart

# Rebuild and restart
docker-compose -f docker-compose-ssl.yml down
docker-compose -f docker-compose-ssl.yml build --no-cache
docker-compose -f docker-compose-ssl.yml up -d
```

## Firewall Configuration

Ensure your firewall allows HTTPS traffic:

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Performance Optimization

### Nginx Optimizations

- **Gzip Compression**: Enabled for all text-based content
- **Static File Caching**: 1-year cache for static assets
- **SSL Session Caching**: Optimized SSL session management
- **HTTP/2**: Enabled for better performance

### Backend Optimizations

- **Connection Pooling**: MySQL connection pooling
- **Keep-Alive**: HTTP keep-alive connections
- **Compression**: Response compression enabled

## Maintenance

### Certificate Renewal

When renewing certificates:

1. Replace files in `certs/` directory
2. Restart services:
   ```bash
   docker-compose -f docker-compose-ssl.yml restart
   ```

### Updates

To update the application:

1. Pull latest changes
2. Rebuild and restart:
   ```bash
   docker-compose -f docker-compose-ssl.yml down
   docker-compose -f docker-compose-ssl.yml build
   docker-compose -f docker-compose-ssl.yml up -d
   ```

## Support

For issues or questions:

1. Check the logs for error messages
2. Verify SSL certificate validity
3. Ensure all required ports are open
4. Check domain DNS resolution

The SSL-enabled NOC Monitoring Dashboard provides enterprise-grade security while maintaining all the monitoring capabilities of the original system.