# Chat API

The Chat API enables AI-powered conversations using configured personas. Generate responses, maintain conversation history, and access knowledge base items.

## 📋 Endpoints

- [Send Chat Message](#send-chat-message)

---

## Send Chat Message

Send a message and receive an AI-powered response using a selected persona with optional knowledge base integration.

### Request

```http
POST /api/chat
```

### Headers

```bash
Content-Type: application/json
```

Note: This endpoint does not require an Authorization header.

### Request Body

```json
{
  "message": "I want to install new kitchen cabinets. What should I consider first?",
  "personaId": "appointment-setter",
  "user_id": "+16266635938",
  "remember_history": true,
  "useAI": true,
  "knowledgeIds": ["item_1755047136767_or03emzq6"]
}
```

### cURL Example

```bash
curl --location 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api/chat' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "I want to install new kitchen cabinets. What should I consider first?",
    "personaId": "appointment-setter",
    "user_id": "+16266635938",
    "remember_history": true,
    "useAI": true,
    "knowledgeIds": ["item_1755047136767_or03emzq6"]
  }'
```

### Response

```json
{
  "answer": "Great question! Installing kitchen cabinets is a significant project. Here are the key things to consider first:\n\n**1. Measure Accurately**\n- Measure your kitchen space multiple times\n- Account for appliances, plumbing, and electrical outlets\n- Check for level floors and plumb walls\n\n**2. Plan the Layout**\n- Consider the kitchen work triangle (sink, stove, refrigerator)\n- Plan for adequate counter space\n- Think about storage needs and accessibility\n\n**3. Choose Cabinet Style**\n- Face-frame vs. frameless construction\n- Door styles and materials\n- Hardware selection\n\n**4. Budget Considerations**\n- Cabinet costs typically range from $3,000-$20,000+\n- Factor in installation, countertops, and hardware\n- Consider DIY vs. professional installation\n\n**5. Permits and Codes**\n- Check if permits are needed for electrical/plumbing changes\n- Ensure compliance with local building codes\n\nWould you like me to elaborate on any of these areas or discuss your specific kitchen layout?",
  "sources": [
    {
      "id": "item_1755047136767_or03emzq6",
      "title": "Kitchen Cabinet Installation Guide",
      "relevance": 0.92
    }
  ],
  "persona": {
    "id": "appointment-setter",
    "name": "Appointment Setter",
    "role": "Professional Scheduling Coordinator & Date/Time Specialist"
  },
  "context": {
    "intent": "home_improvement_inquiry",
    "category": "kitchen_renovation",
    "urgency": "medium",
    "complexity": "high"
  },
  "aiGenerated": true,
  "confidence": 0.95,
  "processing_time": 1240,
  "conversation": {
    "user_id": "+16266635938",
    "session_id": "sess_1708123456789",
    "history_saved": true,
    "history_count": 1
  }
}
```

### Request Parameters

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | string | The user's message/question |
| `personaId` | string | ID of the persona to use for the response |
| `user_id` | string | Unique identifier for the user (phone number or user ID) |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `remember_history` | boolean | false | Whether to save and use conversation history |
| `useAI` | boolean | true | Enable AI-powered responses |
| `knowledgeIds` | array | [] | Array of knowledge base item IDs to reference |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | AI-generated response to the user's message |
| `sources` | array | Knowledge base sources used in the response |
| `persona` | object | Information about the persona used |
| `context` | object | Contextual analysis of the request |
| `aiGenerated` | boolean | Whether the response was AI-generated |
| `confidence` | float | Confidence score (0.0-1.0) |
| `processing_time` | integer | Response generation time in milliseconds |
| `conversation` | object | Conversation metadata and history info |

## 🎭 Available Personas

The following personas are currently available in the system. Each persona has unique expertise and communication styles:

### 1. Appointment Setter
- **ID**: `appointment-setter`
- **Role**: Professional Scheduling Coordinator & Date/Time Specialist
- **Experience**: 8+ years in appointment scheduling, calendar management, and time zone coordination
- **Primary Goal**: Accurately parse date/time requests and confirm appointments with precise scheduling details
- **Communication Style**: Professional, precise, and confirmatory. Always repeats back parsed dates in multiple formats for clarity
- **Expertise**: Natural language date parsing, time format conversion, calendar management, scheduling optimization

### 2. Home Improvement Expert
- **ID**: `home-improvement-expert`
- **Role**: Senior Home Improvement Consultant
- **Experience**: 15+ years in residential construction and renovation
- **Primary Goal**: Provide expert guidance on home improvement projects with safety-first approach
- **Communication Style**: Professional, helpful, detailed, and safety-conscious
- **Expertise**: Kitchen renovations, bathroom remodeling, electrical basics, plumbing repairs, flooring installation

### 3. Grosso Sales Master
- **ID**: `grosso-sales-master`
- **Role**: Seasoned Sales Leader
- **Experience**: 10+ years in home improvement sales industry
- **Primary Goal**: Mentor sales representatives and guide successful sales strategies
- **Communication Style**: Confident, supportive, and knowledgeable. Uses proven sales techniques
- **Expertise**: Sales strategy development, price negotiation, customer psychology, objection handling

### 4. Technical Support Specialist
- **ID**: `technical-support`
- **Role**: Home Systems Technical Expert
- **Experience**: 12+ years in HVAC, electrical, and plumbing systems
- **Primary Goal**: Provide technical diagnostics and system maintenance guidance
- **Communication Style**: Technical but accessible, patient, systematic problem-solver
- **Expertise**: HVAC systems, electrical troubleshooting, plumbing systems, home automation

### 5. Chris Voss (Master Negotiator)
- **ID**: `chris-voss-negotiator`
- **Role**: Master Negotiator & Tactical Empathy Expert
- **Experience**: Former FBI hostage negotiator, author of Never Split the Difference
- **Primary Goal**: Guide negotiations using tactical empathy and calibrated questions
- **Communication Style**: Late-night FM DJ voice - deep, slow, and reassuring
- **Expertise**: High-stakes negotiations, conflict resolution, sales psychology, tactical empathy

### 6. John - Sales Manager & Closer
- **ID**: `john-sales-manager`
- **Role**: Elite Home Improvement Sales Manager & Closer
- **Experience**: 20+ years in home improvement sales with proven track record of increasing conversion rates by 40-60%
- **Primary Goal**: Convert leads into satisfied customers by combining expert sales techniques with genuine human connection and industry knowledge
- **Communication Style**: Charismatic, empathetic, and results-driven. Adapts communication style to match customer personality
- **Expertise**: Advanced closing techniques, customer psychology, value-based selling, relationship building, objection handling

### Getting All Personas Programmatically

You can fetch all available personas using the personas API endpoint:

```bash
curl --location 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api/personas' \
  --header 'Content-Type: application/json'
```

---

## Advanced Examples

### Using Different Personas

#### Home Improvement Expert for Technical Advice
```bash
curl --location 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api/chat' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "What should I consider when installing kitchen cabinets?",
    "personaId": "home-improvement-expert",
    "user_id": "+16266635938",
    "remember_history": true,
    "useAI": true,
    "knowledgeIds": []
  }'
```

#### Sales Manager for Value Discussions
```bash
curl --location 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api/chat' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "I am interested in a kitchen renovation but I am concerned about the cost. Can you help me understand the value?",
    "personaId": "john-sales-manager",
    "user_id": "+16266635938", 
    "remember_history": true,
    "useAI": true,
    "knowledgeIds": []
  }'
```

#### Appointment Setter for Scheduling
```bash
curl --location 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api/chat' \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "I would like to schedule a consultation for next Thursday at 2pm",
    "personaId": "appointment-setter",
    "user_id": "+16266635938",
    "remember_history": true,
    "useAI": true,
    "knowledgeIds": []
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