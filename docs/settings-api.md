# Settings API

The Settings API allows you to manage AI configuration, system settings, and application preferences.

## 📋 Endpoints

- [Get AI Settings](#get-ai-settings)
- [Update AI Settings](#update-ai-settings)
- [Update System Configuration](#update-system-configuration)

---

## Get AI Settings

Retrieve current AI configuration settings including model parameters and response preferences.

### Request

```http
GET /api/settings/ai
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### cURL Example

```bash
curl -X GET "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "status": "success",
  "data": {
    "aiSettings": {
      "provider": "openai",
      "model": "gpt-4o",
      "maxTokens": 500,
      "temperature": 0.7,
      "smsMode": false,
      "responseLength": 160,
      "topP": 1.0,
      "frequencyPenalty": 0.0,
      "presencePenalty": 0.0,
      "defaultPersona": "home-improvement-expert",
      "enableFunctionCalling": true,
      "systemPromptPrefix": "You are a helpful AI assistant.",
      "moderationEnabled": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-02-10T14:22:00Z"
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | AI provider: `openai`, `cloudflare` |
| `model` | string | Model name (e.g., `gpt-4o`, `llama-2-7b`) |
| `maxTokens` | integer | Maximum tokens per response |
| `temperature` | float | Randomness level (0.0-2.0) |
| `smsMode` | boolean | Enable SMS-length responses |
| `responseLength` | integer | Max characters when SMS mode enabled |
| `topP` | float | Nucleus sampling parameter |
| `frequencyPenalty` | float | Frequency penalty (-2.0 to 2.0) |
| `presencePenalty` | float | Presence penalty (-2.0 to 2.0) |
| `defaultPersona` | string | Default persona ID for new conversations |
| `enableFunctionCalling` | boolean | Enable AI function calling |
| `systemPromptPrefix` | string | Global system prompt prefix |
| `moderationEnabled` | boolean | Enable content moderation |

---

## Update AI Settings

Update AI configuration parameters and response behavior.

### Request

```http
PUT /api/settings/ai
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "maxTokens": 750,
  "temperature": 0.8,
  "smsMode": true,
  "responseLength": 160,
  "topP": 0.9,
  "frequencyPenalty": 0.1,
  "presencePenalty": 0.0,
  "defaultPersona": "home-improvement-expert",
  "enableFunctionCalling": true,
  "systemPromptPrefix": "You are a knowledgeable home improvement expert.",
  "moderationEnabled": true
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "maxTokens": 750,
    "temperature": 0.8,
    "smsMode": true,
    "responseLength": 160,
    "topP": 0.9,
    "frequencyPenalty": 0.1,
    "presencePenalty": 0.0,
    "defaultPersona": "home-improvement-expert",
    "enableFunctionCalling": true,
    "systemPromptPrefix": "You are a knowledgeable home improvement expert.",
    "moderationEnabled": true
  }'
```

### Response

```json
{
  "status": "success",
  "data": {
    "aiSettings": {
      "provider": "openai",
      "model": "gpt-4o",
      "maxTokens": 750,
      "temperature": 0.8,
      "smsMode": true,
      "responseLength": 160,
      "topP": 0.9,
      "frequencyPenalty": 0.1,
      "presencePenalty": 0.0,
      "defaultPersona": "home-improvement-expert",
      "enableFunctionCalling": true,
      "systemPromptPrefix": "You are a knowledgeable home improvement expert.",
      "moderationEnabled": true,
      "updatedAt": "2024-02-16T15:45:30Z"
    }
  },
  "message": "AI settings updated successfully"
}
```

### Parameter Limits

| Parameter | Min | Max | Default |
|-----------|-----|-----|---------|
| `maxTokens` | 1 | 4000 | 500 |
| `temperature` | 0.0 | 2.0 | 0.7 |
| `responseLength` | 50 | 500 | 160 |
| `topP` | 0.0 | 1.0 | 1.0 |
| `frequencyPenalty` | -2.0 | 2.0 | 0.0 |
| `presencePenalty` | -2.0 | 2.0 | 0.0 |

### Provider-Specific Settings

#### OpenAI Provider
```bash
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "maxTokens": 1000,
    "temperature": 0.7,
    "topP": 1.0,
    "frequencyPenalty": 0.0,
    "presencePenalty": 0.0
  }'
```

#### Cloudflare Workers AI Provider
```bash
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "cloudflare",
    "model": "@cf/meta/llama-2-7b-chat-fp16",
    "maxTokens": 500,
    "temperature": 0.8
  }'
```

---

## Update System Configuration

Update system-wide configuration including API endpoints, security settings, and feature flags.

### Request

```http
PUT /api/settings/config
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "apiEndpoint": "https://knowledge-base-api.benjiemalinao879557.workers.dev/api",
  "openAIKey": "sk-...",
  "cloudflareAccountId": "your-account-id",
  "enableAnalytics": true,
  "enableDebugMode": false,
  "rateLimiting": {
    "enabled": true,
    "requestsPerHour": 1000,
    "burstLimit": 50
  },
  "security": {
    "corsOrigins": ["https://myknowledgebase.pages.dev"],
    "allowedIPs": [],
    "requireHttps": true
  },
  "features": {
    "conversationHistory": true,
    "multiPersonaChat": true,
    "functionCalling": true,
    "customPrompts": true
  },
  "notifications": {
    "errorWebhookUrl": "https://hooks.slack.com/...",
    "usageThreshold": 90,
    "enableEmailAlerts": true
  }
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:8787/api/settings/config" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "apiEndpoint": "https://knowledge-base-api.benjiemalinao879557.workers.dev/api",
    "enableAnalytics": true,
    "enableDebugMode": false,
    "rateLimiting": {
      "enabled": true,
      "requestsPerHour": 1000,
      "burstLimit": 50
    },
    "security": {
      "corsOrigins": ["https://myknowledgebase.pages.dev"],
      "requireHttps": true
    },
    "features": {
      "conversationHistory": true,
      "multiPersonaChat": true,
      "functionCalling": true
    }
  }'
```

### Response

```json
{
  "status": "success",
  "data": {
    "config": {
      "apiEndpoint": "https://knowledge-base-api.benjiemalinao879557.workers.dev/api",
      "enableAnalytics": true,
      "enableDebugMode": false,
      "rateLimiting": {
        "enabled": true,
        "requestsPerHour": 1000,
        "burstLimit": 50
      },
      "security": {
        "corsOrigins": ["https://myknowledgebase.pages.dev"],
        "allowedIPs": [],
        "requireHttps": true
      },
      "features": {
        "conversationHistory": true,
        "multiPersonaChat": true,
        "functionCalling": true,
        "customPrompts": true
      },
      "updatedAt": "2024-02-16T15:50:15Z"
    }
  },
  "message": "System configuration updated successfully"
}
```

### Configuration Categories

#### Rate Limiting Settings
| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable rate limiting |
| `requestsPerHour` | integer | Max requests per hour |
| `burstLimit` | integer | Max burst requests |

#### Security Settings  
| Field | Type | Description |
|-------|------|-------------|
| `corsOrigins` | array | Allowed CORS origins |
| `allowedIPs` | array | IP whitelist (empty = all allowed) |
| `requireHttps` | boolean | Enforce HTTPS connections |

#### Feature Flags
| Field | Type | Description |
|-------|------|-------------|
| `conversationHistory` | boolean | Enable conversation persistence |
| `multiPersonaChat` | boolean | Allow multiple personas in chat |
| `functionCalling` | boolean | Enable AI function calling |
| `customPrompts` | boolean | Allow custom system prompts |

---

## Advanced Configuration Examples

### Development Environment Setup

```bash
curl -X PUT "http://localhost:8787/api/settings/config" \
  -H "Authorization: Bearer kb_test_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "apiEndpoint": "http://localhost:8787/api",
    "enableAnalytics": false,
    "enableDebugMode": true,
    "rateLimiting": {
      "enabled": false
    },
    "security": {
      "corsOrigins": ["http://localhost:5173", "http://localhost:3000"],
      "requireHttps": false
    },
    "features": {
      "conversationHistory": true,
      "multiPersonaChat": true,
      "functionCalling": true,
      "customPrompts": true
    }
  }'
```

### Production Environment Setup

```bash
curl -X PUT "http://localhost:8787/api/settings/config" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "apiEndpoint": "https://knowledge-base-api.benjiemalinao879557.workers.dev/api",
    "enableAnalytics": true,
    "enableDebugMode": false,
    "rateLimiting": {
      "enabled": true,
      "requestsPerHour": 5000,
      "burstLimit": 100
    },
    "security": {
      "corsOrigins": [
        "https://myknowledgebase.pages.dev",
        "https://myknowledgebase-dev.pages.dev"
      ],
      "requireHttps": true
    },
    "features": {
      "conversationHistory": true,
      "multiPersonaChat": true,
      "functionCalling": true,
      "customPrompts": false
    },
    "notifications": {
      "errorWebhookUrl": "https://hooks.slack.com/services/...",
      "usageThreshold": 80,
      "enableEmailAlerts": true
    }
  }'
```

### Backup and Restore Configuration

```bash
#!/bin/bash

# Backup current settings
backup_ai_settings() {
  curl -s -X GET "http://localhost:8787/api/settings/ai" \
    -H "Authorization: Bearer kb_live_1234567890abcdef" \
    > ai_settings_backup.json
  echo "AI settings backed up to ai_settings_backup.json"
}

# Restore settings from backup
restore_ai_settings() {
  if [ -f "ai_settings_backup.json" ]; then
    settings=$(cat ai_settings_backup.json | jq '.data.aiSettings')
    curl -X PUT "http://localhost:8787/api/settings/ai" \
      -H "Authorization: Bearer kb_live_1234567890abcdef" \
      -H "Content-Type: application/json" \
      -d "$settings"
    echo "AI settings restored from backup"
  else
    echo "Backup file not found"
  fi
}

# Usage
backup_ai_settings
# restore_ai_settings
```

---

## Error Responses

### 400 Bad Request - Invalid Configuration

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration values",
    "details": {
      "temperature": "Temperature must be between 0.0 and 2.0",
      "maxTokens": "Max tokens must be between 1 and 4000"
    }
  }
}
```

### 400 Bad Request - Invalid Model

```json
{
  "error": {
    "code": "INVALID_MODEL",
    "message": "Unsupported model for selected provider",
    "details": "Model 'gpt-4o' is not available for provider 'cloudflare'"
  }
}
```

### 403 Forbidden - Insufficient Permissions

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "API key does not have admin permissions",
    "details": "Settings modification requires admin or owner permissions"
  }
}
```

---

## Best Practices

### 1. Environment-Specific Settings

```bash
# Development
export API_ENDPOINT="http://localhost:8787/api"
export DEBUG_MODE="true"
export RATE_LIMITING="false"

# Production  
export API_ENDPOINT="https://knowledge-base-api.benjiemalinao879557.workers.dev/api"
export DEBUG_MODE="false"
export RATE_LIMITING="true"

# Apply environment-specific settings
curl -X PUT "${API_ENDPOINT}/settings/config" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"enableDebugMode\": ${DEBUG_MODE},
    \"rateLimiting\": {\"enabled\": ${RATE_LIMITING}}
  }"
```

### 2. Gradual Model Rollout

```bash
# Start with conservative settings
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "temperature": 0.5,
    "maxTokens": 300
  }'

# Monitor performance, then adjust
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 0.7,
    "maxTokens": 500
  }'
```

### 3. A/B Testing Configuration

```bash
# Configuration A: More creative
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 0.9,
    "topP": 0.9,
    "frequencyPenalty": 0.2
  }'

# Configuration B: More focused  
curl -X PUT "http://localhost:8787/api/settings/ai" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 0.3,
    "topP": 0.7,
    "frequencyPenalty": 0.0
  }'
```