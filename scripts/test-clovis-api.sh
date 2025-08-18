#!/bin/bash

# Set your API key and base URL
CLOVIS_API_KEY="your-api-key-here"
CLOVIS_API_BASE="http://localhost:5173"

echo "=== Testing Clovis API CORS and Security ==="

# Test 1: Valid origin and API key (should work)
echo "Test 1: Valid request from allowed origin..."
curl -X GET "${CLOVIS_API_BASE}/api/products" \
  -H "Origin: https://stratus-ventures.org" \
  -H "clovis-api-key: ${CLOVIS_API_KEY}" \
  -v

echo -e "\n\n"

# Test 2: Invalid origin (should fail with 403)
echo "Test 2: Invalid origin (should fail)..."
curl -X GET "${CLOVIS_API_BASE}/api/products" \
  -H "Origin: https://malicious-site.com" \
  -H "clovis-api-key: ${CLOVIS_API_KEY}" \
  -v

echo -e "\n\n"

# Test 3: No API key (should fail with 401)
echo "Test 3: Missing API key (should fail)..."
curl -X GET "${CLOVIS_API_BASE}/api/products" \
  -H "Origin: https://stratus-ventures.org" \
  -v

echo -e "\n\n"

# Test 4: Wrong API key (should fail with 401)
echo "Test 4: Invalid API key (should fail)..."
curl -X GET "${CLOVIS_API_BASE}/api/products" \
  -H "Origin: https://stratus-ventures.org" \
  -H "clovis-api-key: wrong-key" \
  -v

echo -e "\n\n"

# Test 5: Test events endpoint
echo "Test 5: Valid events request..."
curl -X GET "${CLOVIS_API_BASE}/api/events" \
  -H "Origin: https://stratus-ventures.org" \
  -H "clovis-api-key: ${CLOVIS_API_KEY}" \
  -v

echo -e "\n\n"

# Test 6: CORS preflight
echo "Test 6: CORS preflight OPTIONS request..."
curl -X OPTIONS "${CLOVIS_API_BASE}/api/products" \
  -H "Origin: https://stratus-ventures.org" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: clovis-api-key" \
  -v

echo -e "\n\nDone!"