#!/bin/bash

# NOC Monitoring SSL Diagnosis and Fix Script
echo "🔍 Diagnosing SSL connection issues..."

# Function to print colored output
print_status() {
    case $1 in
        "ERROR") echo -e "\033[31m❌ $2\033[0m" ;;
        "SUCCESS") echo -e "\033[32m✅ $2\033[0m" ;;
        "WARNING") echo -e "\033[33m⚠️  $2\033[0m" ;;
        "INFO") echo -e "\033[34mℹ️  $2\033[0m" ;;
    esac
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_status "WARNING" "Running as root. This is not recommended for production."
fi

# 1. Check if certificates exist
print_status "INFO" "Checking SSL certificates..."
if [ ! -f "certs/ca-umm.crt" ] || [ ! -f "certs/umm.key" ]; then
    print_status "ERROR" "SSL certificates not found!"
    echo "Creating certs directory and example certificates..."
    mkdir -p certs
    
    # Create self-signed certificate for testing
    print_status "INFO" "Creating temporary self-signed certificate for testing..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/umm.key \
        -out certs/ca-umm.crt \
        -subj "/C=ID/ST=East Java/L=Malang/O=UMM/OU=BSID/CN=dev-suhu.umm.ac.id"
    
    print_status "SUCCESS" "Temporary certificate created. Replace with your real certificates."
fi

# 2. Check certificate permissions
print_status "INFO" "Setting certificate permissions..."
chmod 600 certs/umm.key
chmod 644 certs/ca-umm.crt
chown $USER:$USER certs/*

# 3. Check if ports are available
print_status "INFO" "Checking port availability..."
for port in 80 443 3000 3001; do
    if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
        print_status "WARNING" "Port $port is already in use"
        print_status "INFO" "Processes using port $port:"
        netstat -tlnp 2>/dev/null | grep ":$port "
    else
        print_status "SUCCESS" "Port $port is available"
    fi
done

# 4. Stop any existing services
print_status "INFO" "Stopping existing services..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-ssl.yml down 2>/dev/null || true

# Kill any processes on required ports
for port in 80 443 3000 3001; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_status "INFO" "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
done

# 5. Check Docker
print_status "INFO" "Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_status "ERROR" "Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_status "ERROR" "Docker daemon is not running"
    exit 1
fi

print_status "SUCCESS" "Docker is running"

# 6. Create environment file
print_status "INFO" "Creating environment configuration..."
cat > .env << EOF
# SSL Configuration
NODE_ENV=production
HTTP_PORT=3000
HTTPS_PORT=3001

# Database Configuration
MYSQL_HOST=10.10.11.27
MYSQL_USER=root
MYSQL_PASSWORD=bismillah123
MYSQL_DATABASE=suhu

# CORS Configuration
CORS_ORIGIN=https://dev-suhu.umm.ac.id

# JWT Secret
JWT_SECRET=noc-monitoring-jwt-secret-$(date +%s)

# Frontend Configuration
VITE_SOCKET_SERVER=https://dev-suhu.umm.ac.id
EOF

# 7. Create logs directories
print_status "INFO" "Creating log directories..."
mkdir -p logs/nginx logs/backend
chmod 755 logs logs/nginx logs/backend

# 8. Build and start services
print_status "INFO" "Building and starting services..."
docker-compose -f docker-compose-ssl.yml build --no-cache

if [ $? -ne 0 ]; then
    print_status "ERROR" "Docker build failed"
    exit 1
fi

docker-compose -f docker-compose-ssl.yml up -d

if [ $? -ne 0 ]; then
    print_status "ERROR" "Docker startup failed"
    exit 1
fi

# 9. Wait for services to start
print_status "INFO" "Waiting for services to initialize..."
sleep 15

# 10. Check service status
print_status "INFO" "Checking service status..."
docker-compose -f docker-compose-ssl.yml ps

# 11. Test connectivity
print_status "INFO" "Testing connectivity..."

# Test backend HTTPS
if curl -k -s --connect-timeout 5 https://localhost:3001/api/health > /dev/null; then
    print_status "SUCCESS" "Backend HTTPS is responding"
else
    print_status "ERROR" "Backend HTTPS is not responding"
    print_status "INFO" "Backend logs:"
    docker-compose -f docker-compose-ssl.yml logs --tail=20 noc-monitoring-backend
fi

# Test frontend HTTPS
if curl -k -s --connect-timeout 5 https://localhost/ > /dev/null; then
    print_status "SUCCESS" "Frontend HTTPS is responding"
else
    print_status "ERROR" "Frontend HTTPS is not responding"
    print_status "INFO" "Frontend logs:"
    docker-compose -f docker-compose-ssl.yml logs --tail=20 noc-monitoring-frontend
fi

# Test HTTP redirect
if curl -s --connect-timeout 5 -I http://localhost/ | grep -q "301\|302"; then
    print_status "SUCCESS" "HTTP to HTTPS redirect is working"
else
    print_status "WARNING" "HTTP to HTTPS redirect may not be working"
fi

# 12. Check firewall
print_status "INFO" "Checking firewall status..."
if command -v ufw &> /dev/null; then
    ufw_status=$(ufw status 2>/dev/null | grep "Status:" | awk '{print $2}')
    if [ "$ufw_status" = "active" ]; then
        print_status "INFO" "UFW firewall is active"
        if ufw status | grep -q "80\|443"; then
            print_status "SUCCESS" "Firewall allows HTTP/HTTPS traffic"
        else
            print_status "WARNING" "Firewall may be blocking HTTP/HTTPS traffic"
            print_status "INFO" "To allow traffic: sudo ufw allow 80 && sudo ufw allow 443"
        fi
    fi
fi

# 13. DNS check
print_status "INFO" "Checking DNS resolution..."
if nslookup dev-suhu.umm.ac.id > /dev/null 2>&1; then
    print_status "SUCCESS" "Domain resolves correctly"
else
    print_status "WARNING" "Domain may not resolve correctly"
    print_status "INFO" "For local testing, add to /etc/hosts: 127.0.0.1 dev-suhu.umm.ac.id"
fi

# 14. Final status
echo ""
print_status "INFO" "=== FINAL STATUS ==="
echo ""
print_status "INFO" "Services should be available at:"
echo "   🌐 https://dev-suhu.umm.ac.id (main site)"
echo "   🌐 https://localhost (local access)"
echo "   🔧 https://localhost:3001/api/health (backend health)"
echo ""
print_status "INFO" "To view logs: docker-compose -f docker-compose-ssl.yml logs -f"
print_status "INFO" "To stop: docker-compose -f docker-compose-ssl.yml down"
echo ""

# Show container status
print_status "INFO" "Container status:"
docker-compose -f docker-compose-ssl.yml ps

echo ""
print_status "SUCCESS" "Diagnosis and fix complete!"