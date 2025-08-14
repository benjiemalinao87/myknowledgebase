# Chat API

The Chat API enables AI-powered conversations using configured personas. Generate responses, maintain conversation history, and customize AI behavior.

## 📋 Endpoints

- [Create Chat Completion](#create-chat-completion)

---

## Create Chat Completion

Generate an AI response using a selected persona and conversation context.

### Request

```http
POST /api/chat/completions
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "personaId": "home-improvement-expert",
  "messages": [
    {
      "role": "user",
      "content": "I want to install new kitchen cabinets. What should I consider first?"
    }
  ],
  "settings": {
    "maxTokens": 500,
    "temperature": 0.7,
    "smsMode": false
  }
}
```

### cURL Example

```bash
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "messages": [
      {
        "role": "user",
        "content": "I want to install new kitchen cabinets. What should I consider first?"
      }
    ],
    "settings": {
      "maxTokens": 500,
      "temperature": 0.7,
      "smsMode": false
    }
  }'
```

### Response

```json
{
  "status": "success",
  "data": {
    "id": "chatcmpl-8x9y7z1234567890",
    "object": "chat.completion",
    "created": 1708123456,
    "model": "gpt-4o",
    "persona": {
      "id": "home-improvement-expert",
      "name": "Home Improvement Expert"
    },
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "Great question! Installing kitchen cabinets is a significant project. Here are the key things to consider first:\n\n**1. Measure Accurately**\n- Measure your kitchen space multiple times\n- Account for appliances, plumbing, and electrical outlets\n- Check for level floors and plumb walls\n\n**2. Plan the Layout**\n- Consider the kitchen work triangle (sink, stove, refrigerator)\n- Plan for adequate counter space\n- Think about storage needs and accessibility\n\n**3. Choose Cabinet Style**\n- Face-frame vs. frameless construction\n- Door styles and materials\n- Hardware selection\n\n**4. Budget Considerations**\n- Cabinet costs typically range from $3,000-$20,000+\n- Factor in installation, countertops, and hardware\n- Consider DIY vs. professional installation\n\n**5. Permits and Codes**\n- Check if permits are needed for electrical/plumbing changes\n- Ensure compliance with local building codes\n\nWould you like me to elaborate on any of these areas or discuss your specific kitchen layout?"
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 245,
      "total_tokens": 395
    },
    "responseTime": 2340
  }
}
```

### Request Parameters

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `personaId` | string | ID of the persona to use for the response |
| `messages` | array | Array of conversation messages |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `settings` | object | - | AI generation settings |
| `conversationId` | string | - | ID for conversation continuity |
| `stream` | boolean | false | Enable streaming responses |

#### Settings Object

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxTokens` | integer | 500 | Maximum tokens in response |
| `temperature` | float | 0.7 | Randomness (0.0-2.0) |
| `smsMode` | boolean | false | Limit response to SMS length |
| `responseLength` | integer | 160 | Max chars when SMS mode enabled |

#### Message Object

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Message role: `user`, `assistant`, `system` |
| `content` | string | Message content |
| `timestamp` | string | ISO timestamp (optional) |

---

## Advanced Examples

### Multi-turn Conversation

```bash
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "conversationId": "conv-123456",
    "messages": [
      {
        "role": "user",
        "content": "I want to install new kitchen cabinets. What should I consider first?"
      },
      {
        "role": "assistant",
        "content": "Great question! Installing kitchen cabinets is a significant project. Here are the key things to consider first: [previous response content]"
      },
      {
        "role": "user",
        "content": "What tools will I need for installation?"
      }
    ],
    "settings": {
      "maxTokens": 400,
      "temperature": 0.6
    }
  }'
```

### SMS Mode Response

```bash
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "messages": [
      {
        "role": "user",
        "content": "Quick tip for hanging drywall?"
      }
    ],
    "settings": {
      "smsMode": true,
      "responseLength": 160,
      "temperature": 0.5
    }
  }'
```

**SMS Response:**
```json
{
  "status": "success",
  "data": {
    "choices": [
      {
        "message": {
          "content": "Mark studs first, use drywall screws every 12\", start from center outward. Score & snap for cuts. Check local codes for thickness requirements."
        }
      }
    ],
    "usage": {
      "completion_tokens": 28
    },
    "smsMode": true
  }
}
```

### System Message for Context

```bash
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "messages": [
      {
        "role": "system",
        "content": "The user is a beginner DIYer working on their first major kitchen renovation. Emphasize safety and suggest when to call professionals."
      },
      {
        "role": "user",
        "content": "Should I install the electrical outlets myself?"
      }
    ],
    "settings": {
      "maxTokens": 300,
      "temperature": 0.4
    }
  }'
```

### Streaming Response

```bash
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "messages": [
      {
        "role": "user",
        "content": "Explain the steps to tile a bathroom floor"
      }
    ],
    "stream": true,
    "settings": {
      "maxTokens": 600,
      "temperature": 0.6
    }
  }'
```

**Streaming Response (Server-Sent Events):**
```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":"Here"}}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":" are"}}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":" the"}}]}

...

data: [DONE]
```

---

## Error Responses

### 400 Bad Request - Missing Required Fields

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "personaId": "Persona ID is required",
      "messages": "At least one message is required"
    }
  }
}
```

### 400 Bad Request - Invalid Message Format

```json
{
  "error": {
    "code": "INVALID_MESSAGE_FORMAT",
    "message": "Invalid message structure",
    "details": "Messages must have 'role' and 'content' fields"
  }
}
```

### 404 Not Found - Persona Not Found

```json
{
  "error": {
    "code": "PERSONA_NOT_FOUND",
    "message": "Specified persona not found",
    "details": "No persona found with ID: invalid-persona-id"
  }
}
```

### 429 Rate Limited

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many chat completion requests",
    "details": "Rate limit: 100 requests per hour. Try again in 45 minutes."
  }
}
```

### 500 Internal Server Error - AI Provider Error

```json
{
  "error": {
    "code": "AI_PROVIDER_ERROR",
    "message": "AI service temporarily unavailable",
    "details": "OpenAI API returned an error. Please try again later."
  }
}
```

---

## Best Practices

### 1. Conversation Management

```bash
# Store conversation ID for multi-turn chats
CONV_ID="conv-$(date +%s)"

# First message
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d "{
    \"personaId\": \"home-improvement-expert\",
    \"conversationId\": \"${CONV_ID}\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]
  }"

# Follow-up message with same conversation ID
curl -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"${CONV_ID}\",
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Hello\"},
      {\"role\": \"assistant\", \"content\": \"[previous response]\"},
      {\"role\": \"user\", \"content\": \"Tell me more\"}
    ]
  }"
```

### 2. Error Handling with Retry

```bash
#!/bin/bash

make_chat_request() {
  local persona_id="$1"
  local message="$2"
  local max_retries=3
  local retry_count=0

  while [ $retry_count -lt $max_retries ]; do
    response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8787/api/chat/completions" \
      -H "Authorization: Bearer kb_live_1234567890abcdef" \
      -H "Content-Type: application/json" \
      -d "{
        \"personaId\": \"${persona_id}\",
        \"messages\": [{\"role\": \"user\", \"content\": \"${message}\"}]
      }")
    
    http_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
      echo "$json_response" | jq -r '.data.choices[0].message.content'
      return 0
    elif [ "$http_code" -eq 429 ]; then
      echo "Rate limited, waiting 60 seconds..." >&2
      sleep 60
      retry_count=$((retry_count + 1))
    else
      echo "Error $http_code: $json_response" >&2
      return 1
    fi
  done
  
  echo "Max retries exceeded" >&2
  return 1
}

# Usage
make_chat_request "home-improvement-expert" "How do I install a ceiling fan?"
```

### 3. Token Management

```bash
# Monitor token usage
response=$(curl -s -X POST "http://localhost:8787/api/chat/completions" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "personaId": "home-improvement-expert",
    "messages": [{"role": "user", "content": "Long detailed question here..."}],
    "settings": {"maxTokens": 1000, "temperature": 0.7}
  }')

# Extract token usage
echo "$response" | jq '.data.usage'

# Calculate cost (example pricing)
prompt_tokens=$(echo "$response" | jq '.data.usage.prompt_tokens')
completion_tokens=$(echo "$response" | jq '.data.usage.completion_tokens')
cost=$(echo "scale=4; ($prompt_tokens * 0.0001) + ($completion_tokens * 0.0002)" | bc)
echo "Estimated cost: \$${cost}"
```

### 4. Batch Processing

```bash
#!/bin/bash

# Process multiple questions in batch
questions=(
  "How do I install laminate flooring?"
  "What tools do I need for basic plumbing?"
  "How do I hang heavy pictures on drywall?"
  "What's the best way to paint kitchen cabinets?"
)

for question in "${questions[@]}"; do
  echo "Q: $question"
  echo "A:"
  curl -s -X POST "http://localhost:8787/api/chat/completions" \
    -H "Authorization: Bearer kb_live_1234567890abcdef" \
    -H "Content-Type: application/json" \
    -d "{
      \"personaId\": \"home-improvement-expert\",
      \"messages\": [{\"role\": \"user\", \"content\": \"${question}\"}],
      \"settings\": {\"maxTokens\": 300, \"temperature\": 0.6}
    }" | jq -r '.data.choices[0].message.content'
  echo -e "\n---\n"
  
  # Rate limiting courtesy delay
  sleep 2
done
```