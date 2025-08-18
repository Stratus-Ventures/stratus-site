#!/bin/bash

# Clovis API Test Script
# Tests all endpoints with different origins and edge cases

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    set -o allexport
    source .env
    set +o allexport
fi

# Configuration
API_BASE_URL="${1:-http://localhost:5137}"
API_ENDPOINTS=("/api/stratus-product-events" "/api/stratus-product-meta")

# Origins to test (from .env)
ORIGINS=(
    "$DEV_ORIGIN_1"
    "$DEV_ORIGIN_2" 
    "$PROD_ORIGIN_1"
    "$PROD_ORIGIN_2"
    "$RAILWAY_ORIGIN"
)

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

run_test() {
    local test_name="$1"
    local url="$2"
    local origin="$3"
    local api_key="$4"
    local expected_status="$5"
    
    ((TOTAL_TESTS++))
    
    log_info "Testing: $test_name"
    echo "  URL: $url"
    echo "  Origin: $origin"
    echo "  API Key: ${api_key:0:10}..."
    
    local headers=""
    if [ -n "$origin" ]; then
        headers="$headers -H 'Origin: $origin'"
    fi
    if [ -n "$api_key" ]; then
        headers="$headers -H 'clovis-api-key: $api_key'"
    fi
    
    local response=$(eval "curl -s -w '\n%{http_code}' $headers '$url'")
    local body=$(echo "$response" | head -n -1)
    local status_code=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$test_name - Status: $status_code"
        if [ "$status_code" = "200" ]; then
            echo "  Response preview: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 100)..."
        fi
    else
        log_error "$test_name - Expected: $expected_status, Got: $status_code"
        echo "  Response: $body"
    fi
    
    echo ""
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_summary() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  TEST SUMMARY${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}All tests passed! 🎉${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed! 😞${NC}"
        exit 1
    fi
}

# Main test execution
main() {
    log_info "Starting Clovis API tests..."
    log_info "Base URL: $API_BASE_URL"
    log_info "API Key: ${CLOVIS_API_KEY:0:10}..."
    echo ""

    # Test 1: Valid requests with all origins
    print_header "VALID REQUESTS - ALL ORIGINS"
    for origin in "${ORIGINS[@]}"; do
        if [ -n "$origin" ]; then
            for endpoint in "${API_ENDPOINTS[@]}"; do
                run_test "Valid request from $origin" "$API_BASE_URL$endpoint" "$origin" "$CLOVIS_API_KEY" "200"
            done
        fi
    done

    # Test 2: Invalid API key
    print_header "INVALID API KEY TESTS"
    for endpoint in "${API_ENDPOINTS[@]}"; do
        run_test "Wrong API key" "$API_BASE_URL$endpoint" "$DEV_ORIGIN_1" "wrong-api-key" "401"
        run_test "Empty API key" "$API_BASE_URL$endpoint" "$DEV_ORIGIN_1" "" "401"
        run_test "No API key header" "$API_BASE_URL$endpoint" "$DEV_ORIGIN_1" "" "401"
    done

    # Test 3: Invalid origins
    print_header "INVALID ORIGIN TESTS"
    INVALID_ORIGINS=(
        "http://malicious-site.com"
        "https://evil.example.com"
        "http://localhost:3000"
        "https://unauthorized.com"
        ""
    )
    
    for invalid_origin in "${INVALID_ORIGINS[@]}"; do
        for endpoint in "${API_ENDPOINTS[@]}"; do
            if [ -z "$invalid_origin" ]; then
                run_test "No origin header" "$API_BASE_URL$endpoint" "" "$CLOVIS_API_KEY" "403"
            else
                run_test "Invalid origin: $invalid_origin" "$API_BASE_URL$endpoint" "$invalid_origin" "$CLOVIS_API_KEY" "403"
            fi
        done
    done

    # Test 4: CORS Preflight requests
    print_header "CORS PREFLIGHT TESTS"
    for origin in "${ORIGINS[@]}"; do
        if [ -n "$origin" ]; then
            for endpoint in "${API_ENDPOINTS[@]}"; do
                OPTIONS_RESPONSE=$(curl -s -w '%{http_code}' -X OPTIONS \
                    -H "Origin: $origin" \
                    -H "Access-Control-Request-Method: GET" \
                    -H "Access-Control-Request-Headers: clovis-api-key" \
                    "$API_BASE_URL$endpoint")
                
                STATUS=$(echo "$OPTIONS_RESPONSE" | tail -c 4)
                if [ "$STATUS" = "200" ] || [ "$STATUS" = "204" ]; then
                    log_success "CORS preflight for $origin$endpoint"
                else
                    log_error "CORS preflight for $origin$endpoint - Status: $STATUS"
                fi
                ((TOTAL_TESTS++))
            done
        fi
    done

    # Test 5: HTTP Methods
    print_header "HTTP METHOD TESTS"
    METHODS=("POST" "PUT" "DELETE" "PATCH")
    for method in "${METHODS[@]}"; do
        for endpoint in "${API_ENDPOINTS[@]}"; do
            METHOD_RESPONSE=$(curl -s -w '%{http_code}' -X "$method" \
                -H "Origin: $DEV_ORIGIN_1" \
                -H "clovis-api-key: $CLOVIS_API_KEY" \
                "$API_BASE_URL$endpoint")
            
            STATUS=$(echo "$METHOD_RESPONSE" | tail -c 4)
            if [ "$STATUS" = "405" ]; then
                log_success "Method $method not allowed (as expected)"
            else
                log_error "Method $method should return 405, got: $STATUS"
            fi
            ((TOTAL_TESTS++))
        done
    done

    # Test 6: Edge case headers
    print_header "EDGE CASE HEADER TESTS"
    EDGE_CASES=(
        "Case-Insensitive-Origin:$DEV_ORIGIN_1"
        "clovis-API-key:$CLOVIS_API_KEY"
        "CLOVIS-API-KEY:$CLOVIS_API_KEY"
    )

    for case in "${EDGE_CASES[@]}"; do
        IFS=':' read -r header value <<< "$case"
        for endpoint in "${API_ENDPOINTS[@]}"; do
            if [[ "$header" == *"Origin"* ]]; then
                run_test "Case sensitive origin header" "$API_BASE_URL$endpoint" "" "$CLOVIS_API_KEY" "403"
            else
                EDGE_RESPONSE=$(curl -s -w '%{http_code}' \
                    -H "Origin: $DEV_ORIGIN_1" \
                    -H "$header: $value" \
                    "$API_BASE_URL$endpoint")
                
                STATUS=$(echo "$EDGE_RESPONSE" | tail -c 4)
                if [ "$STATUS" = "401" ]; then
                    log_success "Case sensitive API key header (rejected as expected)"
                else
                    log_error "Case sensitive API key should be rejected, got: $STATUS"
                fi
                ((TOTAL_TESTS++))
            fi
        done
    done

    # Test 7: Malformed requests
    print_header "MALFORMED REQUEST TESTS"
    # Test with very long API key
    LONG_API_KEY=$(printf 'x%.0s' {1..10000})
    for endpoint in "${API_ENDPOINTS[@]}"; do
        run_test "Very long API key" "$API_BASE_URL$endpoint" "$DEV_ORIGIN_1" "$LONG_API_KEY" "401"
    done

    # Test with special characters in API key
    SPECIAL_API_KEY="test<>\"'&;|key"
    for endpoint in "${API_ENDPOINTS[@]}"; do
        run_test "Special chars in API key" "$API_BASE_URL$endpoint" "$DEV_ORIGIN_1" "$SPECIAL_API_KEY" "401"
    done

    # Test 8: Protocol variations
    print_header "PROTOCOL VARIATION TESTS"
    PROTOCOL_VARIATIONS=(
        "http://stratus-ventures.org"   # HTTP version of HTTPS site
        "https://localhost:5137"        # HTTPS version of HTTP dev
    )

    for variation in "${PROTOCOL_VARIATIONS[@]}"; do
        for endpoint in "${API_ENDPOINTS[@]}"; do
            run_test "Protocol variation: $variation" "$API_BASE_URL$endpoint" "$variation" "$CLOVIS_API_KEY" "403"
        done
    done

    # Test 9: Load testing (simple)
    print_header "SIMPLE LOAD TESTS"
    log_info "Running 10 concurrent requests..."
    
    for i in {1..10}; do
        run_test "Concurrent request $i" "$API_BASE_URL${API_ENDPOINTS[0]}" "$DEV_ORIGIN_1" "$CLOVIS_API_KEY" "200" &
    done
    wait
    
    print_summary
}

# Check dependencies
command -v curl >/dev/null 2>&1 || { echo "curl is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || log_warning "jq not found - JSON responses won't be pretty-printed"

# Run main function
main "$@"