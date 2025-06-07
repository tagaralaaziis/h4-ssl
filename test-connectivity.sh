#!/bin/bash

echo "🔍 Testing NOC Monitoring Connectivity"
echo "====================================="

# Test functions
test_http() {
    echo -n "Testing HTTP (port 80): "
    if curl -s --connect-timeout 5 -I http://localhost/ | head -1 | grep -q "301\|302"; then
        echo "✅ REDIRECT OK"
    else
        echo "❌ FAILED"
    fi
}

test_https() {
    echo -n "Testing HTTPS (port 443): "
    if curl -k -s --connect-timeout 5 https://localhost/ > /dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
}

test_backend() {
    echo -n "Testing Backend API: "
    if curl -k -s --connect-timeout 5 https://localhost:3001/api/health > /dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
}

test_domain() {
    echo -n "Testing domain resolution: "
    if nslookup dev-suhu.umm.ac.id > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ FAILED (add to /etc/hosts for local testing)"
    fi
}

# Run tests
test_http
test_https
test_backend
test_domain

echo ""
echo "Port status:"
netstat -tlnp 2>/dev/null | grep -E ":80 |:443 |:3000 |:3001 " || echo "No services listening on expected ports"

echo ""
echo "Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Recent logs:"
docker-compose -f docker-compose-simple.yml logs --tail=10 2>/dev/null || echo "No containers running"