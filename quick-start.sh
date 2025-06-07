#!/bin/bash

echo "🚀 Quick Start - NOC Monitoring with SSL"
echo "========================================"

# Stop any existing services
echo "Stopping existing services..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-ssl.yml down 2>/dev/null || true
docker-compose -f docker-compose-simple.yml down 2>/dev/null || true

# Kill processes on ports
for port in 80 443 3000 3001; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done

# Create directories
mkdir -p certs logs

# Check for certificates
if [ ! -f "certs/ca-umm.crt" ] || [ ! -f "certs/umm.key" ]; then
    echo "Creating temporary self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/umm.key \
        -out certs/ca-umm.crt \
        -subj "/C=ID/ST=East Java/L=Malang/O=UMM/OU=BSID/CN=dev-suhu.umm.ac.id" \
        2>/dev/null
fi

# Set permissions
chmod 600 certs/umm.key
chmod 644 certs/ca-umm.crt

# Build and start
echo "Building and starting services..."
docker-compose -f docker-compose-simple.yml build --no-cache
docker-compose -f docker-compose-simple.yml up -d

# Wait and test
echo "Waiting for services to start..."
sleep 20

echo "Testing connectivity..."
if curl -k -s --connect-timeout 10 https://localhost/ > /dev/null; then
    echo "✅ SUCCESS: HTTPS is working!"
    echo ""
    echo "🌐 Access your dashboard at:"
    echo "   https://dev-suhu.umm.ac.id"
    echo "   https://localhost"
    echo ""
else
    echo "❌ HTTPS test failed. Checking logs..."
    docker-compose -f docker-compose-simple.yml logs --tail=20
fi

echo "Container status:"
docker-compose -f docker-compose-simple.yml ps