# Knowledge Base API Documentation

Welcome to the Knowledge Base API documentation. This API provides endpoints for managing personas, AI interactions, and system configuration.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)

## 🔐 Authentication

All API endpoints (except health check) require authentication using an API key. Include your API key in the request headers:

```bash
Authorization: Bearer YOUR_API_KEY
```

API keys can be generated and managed through the Settings > API Management interface.

## 🌐 Base URL

### Development
```
http://localhost:8787/api
```

### Production
```
https://knowledge-base-api.benjiemalinao879557.workers.dev/api
```

## ⚡ Rate Limits

- **Standard endpoints**: 1000 requests per hour per API key
- **Chat completion**: 100 requests per hour per API key
- **Analytics**: 50 requests per hour per API key

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## 🚨 Error Handling

The API uses standard HTTP response codes and returns error details in JSON format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request body is invalid",
    "details": "Missing required field: name"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

## 📚 API Endpoints

### Core Resources

- **[Personas API](./personas-api.md)** - Manage AI personas and configurations
- **[Chat API](./chat-api.md)** - AI chat completions and interactions
- **[Settings API](./settings-api.md)** - System and AI configuration management
- **[System API](./system-api.md)** - Health checks and analytics

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/personas` | GET | List all personas |
| `/personas` | POST | Create new persona |
| `/personas/{id}` | PUT | Update persona |
| `/personas/{id}` | DELETE | Delete persona |
| `/chat/completions` | POST | Generate AI response |
| `/settings/ai` | GET | Get AI settings |
| `/settings/ai` | PUT | Update AI settings |
| `/settings/config` | PUT | Update system config |
| `/health` | GET | Health check |
| `/analytics/usage` | GET | Usage analytics |

## 🚀 Getting Started

1. **Get an API Key**: Navigate to Settings > API Management in the web interface
2. **Test the Connection**: Use the health check endpoint to verify connectivity
3. **Explore the Playground**: Use the built-in API playground for testing

### Quick Test

```bash
# Test the health endpoint (no auth required)
curl -X GET "http://localhost:8787/api/health"

# List personas (requires auth)
curl -X GET "http://localhost:8787/api/personas" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## 📖 Additional Resources

- [API Playground](../src/components/ApiManagement.tsx) - Interactive testing interface
- [Worker Source Code](../worker/knowledge-base-api/) - Backend implementation
- [Frontend Integration](../src/services/) - Client-side service examples

---

For support or questions, please check the [GitHub repository](https://github.com/benjiemalinao87/myknowledgebase) or file an issue.