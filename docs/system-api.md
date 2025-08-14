# System API

The System API provides health monitoring, analytics, and system status endpoints for operational management.

## 📋 Endpoints

- [Health Check](#health-check)
- [Get Usage Analytics](#get-usage-analytics)

---

## Health Check

Check the overall health and status of the API service. This endpoint does not require authentication and is ideal for monitoring and load balancer health checks.

### Request

```http
GET /api/health
```

### Headers

```bash
Content-Type: application/json
```

Note: No authorization header required for health check.

### cURL Example

```bash
curl -X GET "http://localhost:8787/api/health" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-02-16T15:30:45Z",
  "uptime": "72h 15m 30s",
  "version": "1.2.3",
  "environment": "production",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2024-02-16T15:30:40Z"
    },
    "aiProvider": {
      "status": "healthy",
      "provider": "openai",
      "responseTime": 234,
      "lastCheck": "2024-02-16T15:30:42Z"
    },
    "cache": {
      "status": "healthy",
      "hitRate": 0.87,
      "responseTime": 3,
      "lastCheck": "2024-02-16T15:30:44Z"
    }
  },
  "metrics": {
    "totalRequests": 15234,
    "requestsPerMinute": 45,
    "averageResponseTime": 189,
    "errorRate": 0.002
  },
  "limits": {
    "memory": {
      "used": "128MB",
      "total": "512MB",
      "percentage": 25
    },
    "storage": {
      "used": "2.3GB",
      "total": "10GB",
      "percentage": 23
    }
  }
}
```

### Health Status Values

| Status | Description |
|--------|-------------|
| `healthy` | All systems operational |
| `degraded` | Some non-critical issues |
| `unhealthy` | Critical issues detected |
| `maintenance` | System under maintenance |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall health status |
| `timestamp` | string | ISO timestamp of health check |
| `uptime` | string | System uptime duration |
| `version` | string | API version |
| `environment` | string | Environment (dev, staging, production) |
| `services` | object | Individual service health statuses |
| `metrics` | object | Performance metrics |
| `limits` | object | Resource usage limits |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `detailed` | boolean | false | Include detailed service information |
| `include` | string | all | Services to include: `database,ai,cache` |

### Detailed Health Check

```bash
curl -X GET "http://localhost:8787/api/health?detailed=true" \
  -H "Content-Type: application/json"
```

### Specific Services Health Check

```bash
curl -X GET "http://localhost:8787/api/health?include=database,ai" \
  -H "Content-Type: application/json"
```

---

## Get Usage Analytics

Retrieve detailed usage analytics and performance metrics. Requires authentication with analytics permissions.

### Request

```http
GET /api/analytics/usage
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### cURL Example

```bash
curl -X GET "http://localhost:8787/api/analytics/usage" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "status": "success",
  "data": {
    "timeRange": {
      "start": "2024-02-09T00:00:00Z",
      "end": "2024-02-16T15:30:45Z",
      "duration": "7d 15h 30m"
    },
    "overview": {
      "totalRequests": 45234,
      "totalTokens": 2156789,
      "totalCost": 127.45,
      "averageResponseTime": 1245,
      "errorRate": 0.0023,
      "uniqueUsers": 156
    },
    "endpoints": {
      "/api/chat/completions": {
        "requests": 32156,
        "averageResponseTime": 2340,
        "tokens": 1890234,
        "cost": 98.76,
        "errorRate": 0.0012
      },
      "/api/personas": {
        "requests": 8934,
        "averageResponseTime": 145,
        "tokens": 134567,
        "cost": 15.23,
        "errorRate": 0.0034
      },
      "/api/settings/ai": {
        "requests": 2145,
        "averageResponseTime": 89,
        "tokens": 45678,
        "cost": 5.67,
        "errorRate": 0.0001
      },
      "/api/health": {
        "requests": 1999,
        "averageResponseTime": 45,
        "tokens": 0,
        "cost": 0,
        "errorRate": 0.0000
      }
    },
    "personas": {
      "home-improvement-expert": {
        "requests": 28456,
        "tokens": 1567890,
        "cost": 82.45,
        "averageRating": 4.8
      },
      "garden-design-expert": {
        "requests": 3700,
        "tokens": 322344,
        "cost": 16.31,
        "averageRating": 4.6
      }
    },
    "timeSeriesData": {
      "daily": [
        {
          "date": "2024-02-16",
          "requests": 8234,
          "tokens": 456789,
          "cost": 23.45,
          "averageResponseTime": 1234,
          "errorRate": 0.0015
        },
        {
          "date": "2024-02-15",
          "requests": 7890,
          "tokens": 423456,
          "cost": 21.78,
          "averageResponseTime": 1456,
          "errorRate": 0.0028
        }
      ],
      "hourly": [
        {
          "hour": "2024-02-16T15:00:00Z",
          "requests": 456,
          "tokens": 23456,
          "cost": 1.23,
          "averageResponseTime": 1123,
          "errorRate": 0.0022
        }
      ]
    },
    "errors": {
      "total": 104,
      "byType": {
        "RATE_LIMITED": 45,
        "INVALID_REQUEST": 32,
        "AI_PROVIDER_ERROR": 15,
        "UNAUTHORIZED": 8,
        "NOT_FOUND": 4
      },
      "recentErrors": [
        {
          "timestamp": "2024-02-16T15:25:30Z",
          "type": "RATE_LIMITED",
          "endpoint": "/api/chat/completions",
          "message": "Rate limit exceeded for API key"
        }
      ]
    },
    "performance": {
      "responseTimePercentiles": {
        "p50": 1200,
        "p75": 1800,
        "p90": 2400,
        "p95": 3200,
        "p99": 4800
      },
      "slowestEndpoints": [
        {
          "endpoint": "/api/chat/completions",
          "averageTime": 2340,
          "p99Time": 5600
        }
      ]
    }
  }
}
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start` | string | 7 days ago | Start date (ISO format) |
| `end` | string | now | End date (ISO format) |
| `granularity` | string | daily | Data granularity: `hourly`, `daily`, `weekly` |
| `metrics` | string | all | Metrics to include: `requests,tokens,cost,errors` |
| `endpoints` | string | all | Specific endpoints to analyze |
| `personas` | string | all | Specific personas to analyze |

### Time Range Examples

```bash
# Last 24 hours with hourly granularity
curl -X GET "http://localhost:8787/api/analytics/usage?start=2024-02-15T15:30:45Z&granularity=hourly" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"

# Last 30 days with daily granularity
curl -X GET "http://localhost:8787/api/analytics/usage?start=2024-01-17T00:00:00Z&granularity=daily" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"

# Specific date range
curl -X GET "http://localhost:8787/api/analytics/usage?start=2024-02-01T00:00:00Z&end=2024-02-07T23:59:59Z" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

### Filtered Analytics

```bash
# Only chat completion metrics
curl -X GET "http://localhost:8787/api/analytics/usage?endpoints=/api/chat/completions&metrics=requests,tokens,cost" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"

# Specific persona analytics
curl -X GET "http://localhost:8787/api/analytics/usage?personas=home-improvement-expert" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

---

## Monitoring Examples

### Health Check Monitoring Script

```bash
#!/bin/bash

# Health monitoring script
check_health() {
  local endpoint="$1"
  local response=$(curl -s -w "\n%{http_code}" "$endpoint/api/health")
  local http_code=$(echo "$response" | tail -n1)
  local json_response=$(echo "$response" | head -n -1)
  
  if [ "$http_code" -eq 200 ]; then
    local status=$(echo "$json_response" | jq -r '.status')
    local uptime=$(echo "$json_response" | jq -r '.uptime')
    local version=$(echo "$json_response" | jq -r '.version')
    
    echo "✅ Service is $status"
    echo "⏱️  Uptime: $uptime"
    echo "🏷️  Version: $version"
    
    # Check individual services
    echo "$json_response" | jq -r '.services | to_entries[] | "  \(.key): \(.value.status) (\(.value.responseTime)ms)"'
    
    return 0
  else
    echo "❌ Health check failed (HTTP $http_code)"
    echo "$json_response"
    return 1
  fi
}

# Monitor multiple environments
environments=(
  "http://localhost:8787"
  "https://knowledge-base-api.benjiemalinao879557.workers.dev"
)

for env in "${environments[@]}"; do
  echo "Checking $env..."
  check_health "$env"
  echo "---"
done
```

### Usage Analytics Dashboard Script

```bash
#!/bin/bash

# Analytics dashboard script
generate_report() {
  local api_key="$1"
  local endpoint="$2"
  
  echo "📊 Knowledge Base API Analytics Report"
  echo "======================================="
  echo ""
  
  # Get analytics data
  local analytics=$(curl -s -X GET "${endpoint}/api/analytics/usage?granularity=daily" \
    -H "Authorization: Bearer $api_key" \
    -H "Content-Type: application/json")
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch analytics"
    return 1
  fi
  
  # Overview
  echo "📈 Overview (Last 7 days):"
  echo "  Total Requests: $(echo "$analytics" | jq -r '.data.overview.totalRequests')"
  echo "  Total Tokens: $(echo "$analytics" | jq -r '.data.overview.totalTokens')"
  echo "  Total Cost: \$$(echo "$analytics" | jq -r '.data.overview.totalCost')"
  echo "  Error Rate: $(echo "$analytics" | jq -r '.data.overview.errorRate * 100')%"
  echo "  Unique Users: $(echo "$analytics" | jq -r '.data.overview.uniqueUsers')"
  echo ""
  
  # Top endpoints
  echo "🎯 Top Endpoints:"
  echo "$analytics" | jq -r '.data.endpoints | to_entries[] | "  \(.key): \(.value.requests) requests (\(.value.averageResponseTime)ms avg)"' | head -5
  echo ""
  
  # Persona usage
  echo "🎭 Persona Usage:"
  echo "$analytics" | jq -r '.data.personas | to_entries[] | "  \(.key): \(.value.requests) requests (Rating: \(.value.averageRating)/5.0)"'
  echo ""
  
  # Recent errors
  echo "⚠️  Recent Errors:"
  echo "$analytics" | jq -r '.data.errors.recentErrors[] | "  [\(.timestamp)] \(.type): \(.message)"' | head -5
}

# Usage
API_KEY="kb_live_1234567890abcdef"
ENDPOINT="https://knowledge-base-api.benjiemalinao879557.workers.dev"

generate_report "$API_KEY" "$ENDPOINT"
```

### Performance Monitoring

```bash
#!/bin/bash

# Performance monitoring script
monitor_performance() {
  local endpoint="$1"
  local iterations=10
  local total_time=0
  
  echo "🔍 Performance Test: $iterations requests to $endpoint"
  echo "=================================================="
  
  for i in $(seq 1 $iterations); do
    local start_time=$(date +%s%3N)
    
    local response=$(curl -s -w "%{http_code}" "$endpoint/api/health" -o /dev/null)
    
    local end_time=$(date +%s%3N)
    local request_time=$((end_time - start_time))
    total_time=$((total_time + request_time))
    
    if [ "$response" -eq 200 ]; then
      echo "  Request $i: ${request_time}ms ✅"
    else
      echo "  Request $i: ${request_time}ms ❌ (HTTP $response)"
    fi
    
    sleep 0.1
  done
  
  local average_time=$((total_time / iterations))
  echo ""
  echo "📊 Results:"
  echo "  Average Response Time: ${average_time}ms"
  echo "  Total Time: ${total_time}ms"
}

# Test both environments
monitor_performance "http://localhost:8787"
echo ""
monitor_performance "https://knowledge-base-api.benjiemalinao879557.workers.dev"
```

### Alerting Integration

```bash
#!/bin/bash

# Health check with Slack alerting
check_health_with_alerts() {
  local endpoint="$1"
  local slack_webhook="$2"
  
  local response=$(curl -s -w "\n%{http_code}" "$endpoint/api/health")
  local http_code=$(echo "$response" | tail -n1)
  local json_response=$(echo "$response" | head -n -1)
  
  if [ "$http_code" -eq 200 ]; then
    local status=$(echo "$json_response" | jq -r '.status')
    
    if [ "$status" != "healthy" ]; then
      # Send alert to Slack
      curl -X POST "$slack_webhook" \
        -H 'Content-type: application/json' \
        -d "{
          \"text\": \"⚠️ API Health Alert\",
          \"attachments\": [
            {
              \"color\": \"warning\",
              \"fields\": [
                {\"title\": \"Status\", \"value\": \"$status\", \"short\": true},
                {\"title\": \"Endpoint\", \"value\": \"$endpoint\", \"short\": true}
              ]
            }
          ]
        }"
    fi
  else
    # Send critical alert
    curl -X POST "$slack_webhook" \
      -H 'Content-type: application/json' \
      -d "{
        \"text\": \"🚨 API Down Alert\",
        \"attachments\": [
          {
            \"color\": \"danger\",
            \"fields\": [
              {\"title\": \"HTTP Code\", \"value\": \"$http_code\", \"short\": true},
              {\"title\": \"Endpoint\", \"value\": \"$endpoint\", \"short\": true}
            ]
          }
        ]
      }"
  fi
}

# Usage with Slack webhook
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
check_health_with_alerts "https://knowledge-base-api.benjiemalinao879557.workers.dev" "$SLACK_WEBHOOK"
```

---

## Error Responses

### 401 Unauthorized (Analytics endpoint)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Analytics access requires authentication"
  }
}
```

### 403 Forbidden (Insufficient permissions)

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "API key does not have analytics permissions"
  }
}
```

### 400 Bad Request (Invalid time range)

```json
{
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "Invalid time range specified",
    "details": "Start date cannot be after end date"
  }
}
```

---

## Integration with Monitoring Tools

### Prometheus Metrics Endpoint

The health endpoint can be adapted for Prometheus scraping:

```bash
curl -s "http://localhost:8787/api/health?format=prometheus"
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Knowledge Base API",
    "panels": [
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "api_response_time_ms",
            "legendFormat": "{{endpoint}}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(api_requests_total[5m])",
            "legendFormat": "{{endpoint}}"
          }
        ]
      }
    ]
  }
}
```