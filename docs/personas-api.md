# Personas API

The Personas API allows you to manage AI personas that define the behavior, expertise, and communication style of AI responses.

## 📋 Endpoints

- [Get All Personas](#get-all-personas)
- [Create Persona](#create-persona)
- [Update Persona](#update-persona)
- [Delete Persona](#delete-persona)

---

## Get All Personas

Retrieve all available personas with their configurations.

### Request

```http
GET /api/personas
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### cURL Example

```bash
curl -X GET "http://localhost:8787/api/personas" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "status": "success",
  "data": {
    "personas": [
      {
        "id": "home-improvement-expert",
        "name": "Home Improvement Expert",
        "role": "Construction and Renovation Specialist",
        "experience": "15+ years in residential construction and home renovation",
        "primaryGoal": "Help homeowners make informed decisions about home improvement projects",
        "communicationStyle": "Practical, detailed, and safety-focused",
        "responsibilities": [
          "Provide accurate construction advice",
          "Ensure safety recommendations",
          "Suggest cost-effective solutions",
          "Explain building codes and permits"
        ],
        "constraints": [
          "Always prioritize safety",
          "Recommend professional help for electrical/plumbing",
          "Consider local building codes",
          "Stay within homeowner skill levels"
        ],
        "expertiseAreas": [
          "Carpentry",
          "Plumbing basics",
          "Electrical safety",
          "Paint and finishes",
          "Tools and materials"
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-02-10T14:22:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  }
}
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 50 | Number of personas per page (max 100) |
| `status` | string | all | Filter by status: `active`, `inactive`, `all` |
| `search` | string | - | Search personas by name or role |

### Example with Parameters

```bash
curl -X GET "http://localhost:8787/api/personas?page=1&limit=10&status=active&search=expert" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

---

## Create Persona

Create a new persona configuration.

### Request

```http
POST /api/personas
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Garden Design Expert",
  "role": "Landscape Designer and Horticulturist",
  "experience": "10+ years in landscape design and plant care",
  "primaryGoal": "Help create beautiful, sustainable outdoor spaces",
  "communicationStyle": "Creative, environmentally conscious, and practical",
  "responsibilities": [
    "Provide plant selection advice",
    "Design outdoor spaces",
    "Recommend sustainable practices",
    "Suggest seasonal maintenance"
  ],
  "constraints": [
    "Consider local climate zones",
    "Recommend native plants when possible",
    "Account for maintenance requirements",
    "Respect budget limitations"
  ],
  "expertiseAreas": [
    "Plant selection",
    "Garden design",
    "Soil health",
    "Irrigation systems",
    "Pest management"
  ]
}
```

### cURL Example

```bash
curl -X POST "http://localhost:8787/api/personas" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Garden Design Expert",
    "role": "Landscape Designer and Horticulturist",
    "experience": "10+ years in landscape design and plant care",
    "primaryGoal": "Help create beautiful, sustainable outdoor spaces",
    "communicationStyle": "Creative, environmentally conscious, and practical",
    "responsibilities": [
      "Provide plant selection advice",
      "Design outdoor spaces",
      "Recommend sustainable practices",
      "Suggest seasonal maintenance"
    ],
    "constraints": [
      "Consider local climate zones",
      "Recommend native plants when possible",
      "Account for maintenance requirements",
      "Respect budget limitations"
    ],
    "expertiseAreas": [
      "Plant selection",
      "Garden design",
      "Soil health",
      "Irrigation systems",
      "Pest management"
    ]
  }'
```

### Response

```json
{
  "status": "success",
  "data": {
    "persona": {
      "id": "garden-design-expert-1708123456",
      "name": "Garden Design Expert",
      "role": "Landscape Designer and Horticulturist",
      "experience": "10+ years in landscape design and plant care",
      "primaryGoal": "Help create beautiful, sustainable outdoor spaces",
      "communicationStyle": "Creative, environmentally conscious, and practical",
      "responsibilities": [
        "Provide plant selection advice",
        "Design outdoor spaces",
        "Recommend sustainable practices",
        "Suggest seasonal maintenance"
      ],
      "constraints": [
        "Consider local climate zones",
        "Recommend native plants when possible",
        "Account for maintenance requirements",
        "Respect budget limitations"
      ],
      "expertiseAreas": [
        "Plant selection",
        "Garden design",
        "Soil health",
        "Irrigation systems",
        "Pest management"
      ],
      "status": "active",
      "createdAt": "2024-02-16T15:30:45Z",
      "updatedAt": "2024-02-16T15:30:45Z"
    }
  },
  "message": "Persona created successfully"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Persona display name (max 100 chars) |
| `role` | string | Professional role/title (max 200 chars) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `experience` | string | Professional experience description |
| `primaryGoal` | string | Main objective of the persona |
| `communicationStyle` | string | How the persona communicates |
| `responsibilities` | array | List of key responsibilities |
| `constraints` | array | Behavioral constraints and limitations |
| `expertiseAreas` | array | Areas of expertise/knowledge |

---

## Update Persona

Update an existing persona configuration.

### Request

```http
PUT /api/personas/{id}
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Persona ID to update |

### Request Body

```json
{
  "name": "Senior Home Improvement Expert",
  "experience": "20+ years in residential construction and home renovation",
  "expertiseAreas": [
    "Carpentry",
    "Plumbing basics",
    "Electrical safety",
    "Paint and finishes",
    "Tools and materials",
    "Project management",
    "Building permits"
  ]
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:8787/api/personas/home-improvement-expert" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Home Improvement Expert",
    "experience": "20+ years in residential construction and home renovation",
    "expertiseAreas": [
      "Carpentry",
      "Plumbing basics",
      "Electrical safety",
      "Paint and finishes",
      "Tools and materials",
      "Project management",
      "Building permits"
    ]
  }'
```

### Response

```json
{
  "status": "success",
  "data": {
    "persona": {
      "id": "home-improvement-expert",
      "name": "Senior Home Improvement Expert",
      "role": "Construction and Renovation Specialist",
      "experience": "20+ years in residential construction and home renovation",
      "primaryGoal": "Help homeowners make informed decisions about home improvement projects",
      "communicationStyle": "Practical, detailed, and safety-focused",
      "responsibilities": [
        "Provide accurate construction advice",
        "Ensure safety recommendations",
        "Suggest cost-effective solutions",
        "Explain building codes and permits"
      ],
      "constraints": [
        "Always prioritize safety",
        "Recommend professional help for electrical/plumbing",
        "Consider local building codes",
        "Stay within homeowner skill levels"
      ],
      "expertiseAreas": [
        "Carpentry",
        "Plumbing basics",
        "Electrical safety",
        "Paint and finishes",
        "Tools and materials",
        "Project management",
        "Building permits"
      ],
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-02-16T15:45:30Z"
    }
  },
  "message": "Persona updated successfully"
}
```

---

## Delete Persona

Remove a persona from the system.

### Request

```http
DELETE /api/personas/{id}
```

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Persona ID to delete |

### cURL Example

```bash
curl -X DELETE "http://localhost:8787/api/personas/garden-design-expert-1708123456" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "status": "success",
  "message": "Persona deleted successfully",
  "data": {
    "deletedId": "garden-design-expert-1708123456"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid persona data",
    "details": {
      "name": "Name is required and must be less than 100 characters",
      "role": "Role is required and must be less than 200 characters"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Persona not found",
    "details": "No persona found with ID: invalid-persona-id"
  }
}
```

### 409 Conflict

```json
{
  "error": {
    "code": "PERSONA_EXISTS",
    "message": "A persona with this name already exists",
    "details": "Persona name must be unique"
  }
}
```

---

## Usage Examples

### Complete Persona Management Workflow

```bash
# 1. List existing personas
curl -X GET "http://localhost:8787/api/personas" \
  -H "Authorization: Bearer kb_live_1234567890abcdef"

# 2. Create a new persona
PERSONA_ID=$(curl -X POST "http://localhost:8787/api/personas" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Persona", "role": "Test Role"}' \
  | jq -r '.data.persona.id')

# 3. Update the persona
curl -X PUT "http://localhost:8787/api/personas/${PERSONA_ID}" \
  -H "Authorization: Bearer kb_live_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Persona"}'

# 4. Delete the persona
curl -X DELETE "http://localhost:8787/api/personas/${PERSONA_ID}" \
  -H "Authorization: Bearer kb_live_1234567890abcdef"
```

### Batch Operations

```bash
# Create multiple personas
for persona in "Kitchen Designer" "Bathroom Specialist" "Flooring Expert"; do
  curl -X POST "http://localhost:8787/api/personas" \
    -H "Authorization: Bearer kb_live_1234567890abcdef" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${persona}\", \"role\": \"${persona} Specialist\"}"
done
```