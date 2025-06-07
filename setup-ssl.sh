#!/bin/bash

# NOC Monitoring SSL Setup Script
echo "🔒 Setting up SSL for NOC Monitoring System..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p certs logs/nginx logs/backend

# Check if SSL certificates exist
if [ ! -f "certs/ca-umm.crt" ] || [ ! -f "certs/umm.key" ]; then
    echo "❌ SSL certificates not found!"
    echo "Please place your SSL certificates in the certs/ directory:"
    echo "  - certs/ca-umm.crt (certificate file)"
    echo "  - certs/umm.key (private key file)"
    exit 1
fi

echo "✅ SSL certificates found"

# Set proper permissions for certificates
echo "🔐 Setting certificate permissions..."
chmod 600 certs/umm.key
chmod 644 certs/ca-umm.crt

# Validate certificates
echo "🔍 Validating SSL certificates..."
if openssl x509 -in certs/ca-umm.crt -text -noout > /dev/null 2>&1; then
    echo "✅ Certificate is valid"
    
    # Show certificate details
    echo "📋 Certificate details:"
    openssl x509 -in certs/ca-umm.crt -subject -issuer -dates -noout
else
    echo "❌ Certificate validation failed"
    exit 1
fi

# Check if private key matches certificate
echo "🔑 Checking if private key matches certificate..."
cert_modulus=$(openssl x509 -noout -modulus -in certs/ca-umm.crt | openssl md5)
key_modulus=$(openssl rsa -noout -modulus -in certs/umm.key | openssl md5)

if [ "$cert_modulus" = "$key_modulus" ]; then
    echo "✅ Private key matches certificate"
else
    echo "❌ Private key does not match certificate"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.ssl .env
    echo "⚠️  Please review and update the .env file with your specific configuration"
fi

# Build and start services
echo "🚀 Building and starting SSL-enabled services..."

# Stop existing services
docker-compose down 2>/dev/null || true

# Build and start with SSL configuration
docker-compose -f docker-compose-ssl.yml build
docker-compose -f docker-compose-ssl.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check backend health
if curl -k -s https://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service health check failed"
fi

# Check frontend
if curl -k -s https://localhost/ > /dev/null; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service health check failed"
fi

echo ""
echo "🎉 SSL setup complete!"
echo ""
echo "📊 Your NOC Monitoring Dashboard is now available at:"
echo "   🌐 https://dev-suhu.umm.ac.id"
echo ""
echo "🔧 Service URLs:"
echo "   Frontend: https://localhost (port 443)"
echo "   Backend:  https://localhost:3001"
echo "   HTTP redirect: http://localhost (port 80) → HTTPS"
echo ""
echo "📋 To check logs:"
echo "   docker-compose -f docker-compose-ssl.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose-ssl.yml down"
echo ""
echo "⚠️  Important notes:"
echo "   - Make sure your domain dev-suhu.umm.ac.id points to this server"
echo "   - Update firewall rules to allow ports 80 and 443"
echo "   - Review the .env file for any additional configuration"
echo "   - Monitor logs for any SSL-related issues"