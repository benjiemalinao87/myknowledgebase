# Cloudflare Implementation Plan for Knowledge Base Application

## Overview
Transform the current mock-based React knowledge base application into a production-ready system using Cloudflare Workers, AI Gateway, D1 Database, R2 Storage, and Vectorize.

## Architecture Comparison

### Current Architecture (Mock-based)
```
React Frontend
    ↓
Mock Services (in-memory)
    - api.ts (simulated ingestion)
    - knowledgeService.ts (mock data)
    - visualizationService.ts (random data)
```

### Target Architecture (Cloudflare-powered)
```
React Frontend
    ↓
Cloudflare Workers (Edge API)
    ├── D1 Database (metadata storage)
    ├── R2 Storage (file storage)
    ├── Vectorize (vector embeddings)
    └── AI Gateway (LLM & embeddings)
```

## API Endpoints Specification

### Base URL
```
https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev
```

### Endpoint Details

#### 1. Document/Link/Context Ingestion
```bash
POST /api/ingest
Content-Type: application/json

Request Body:
{
  "type": "file" | "link" | "context",
  "title": "Kitchen Renovation Guide.pdf",
  "content": "file content or text",
  "url": "https://example.com" // optional, for links
}

Response:
{
  "success": true,
  "id": "item_123",
  "embeddings_generated": true
}
```

#### 2. Get All Knowledge Items
```bash
GET /api/knowledge

Response:
{
  "items": [
    {
      "id": "1",
      "type": "file",
      "title": "Kitchen Renovation Guide.pdf",
      "fileType": "pdf",
      "size": 2400000,
      "addedAt": "2024-12-15T00:00:00Z",
      "status": "active",
      "tags": ["kitchen", "renovation", "guide"]
    }
  ]
}
```

#### 3. Search Knowledge Base
```bash
GET /api/search?q=kitchen+renovation

Response:
{
  "results": [
    {
      "id": "1",
      "title": "Kitchen Renovation Guide.pdf",
      "relevance_score": 0.95,
      "excerpt": "Complete guide to kitchen renovation..."
    }
  ]
}
```

#### 4. Delete Knowledge Item
```bash
DELETE /api/knowledge/{id}

Response:
{
  "success": true,
  "deleted_id": "item_123"
}
```

#### 5. Get Visualization Data
```bash
GET /api/visualizations

Response:
{
  "embeddings": [...],
  "clusters": [...],
  "metadata": [...],
  "knowledgeGraph": {...},
  "stats": {...}
}
```

#### 6. AI Chat
```bash
POST /api/chat
Content-Type: application/json

Request Body:
{
  "message": "why would I choose you?"
}

Response:
{
  "answer": "Based on our comprehensive home improvement expertise...",
  "sources": ["CLIENT_KNOWLEDGE_BASE_EXPLANATION.md", ...],
  "confidence": 0.92,
  "processing_time": 487
}
```

## Sample CURL Requests

### Basic Chat Query
```bash
curl -X POST https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "why would I choose you?"}'
```

### Document Ingestion
```bash
curl -X POST https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "file",
    "title": "Bathroom Renovation Guide.pdf",
    "content": "Complete guide to bathroom renovation including..."
  }'
```

### Search Query
```bash
curl -X GET "https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api/search?q=kitchen%20renovation"
```

## Cloudflare Services Configuration

### 1. D1 Database Schema
```sql
-- Knowledge items table
CREATE TABLE knowledge_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('file', 'link', 'context')),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  file_type TEXT,
  size INTEGER,
  status TEXT DEFAULT 'active',
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

-- Processing metadata table
CREATE TABLE processing_metadata (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  chunk_size INTEGER,
  token_count INTEGER,
  processing_time INTEGER,
  sentiment TEXT,
  complexity TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_knowledge_items_type ON knowledge_items(type);
CREATE INDEX idx_knowledge_items_status ON knowledge_items(status);
CREATE INDEX idx_tags_item_id ON tags(item_id);
CREATE INDEX idx_tags_tag ON tags(tag);
```

### 2. Test Data for D1
```sql
-- Insert test knowledge items
INSERT INTO knowledge_items (id, type, title, content, file_type, size, status) VALUES
  ('1', 'file', 'Kitchen Renovation Guide.pdf', 'Complete guide to kitchen renovation including cabinet installation, appliance selection, and budgeting tips.', 'pdf', 2400000, 'active'),
  ('2', 'link', 'Home Depot - Bathroom Tiles', NULL, NULL, NULL, 'active'),
  ('3', 'file', 'Electrical Wiring Basics.docx', 'Safety procedures and basic wiring techniques for home electrical work.', 'docx', 1800000, 'active'),
  ('4', 'context', 'Living Room Renovation Context', 'Planning to renovate a 15x20 living room with hardwood floors, budget of $15,000, modern farmhouse style preferred.', NULL, NULL, 'active'),
  ('5', 'link', 'DIY Plumbing Repairs', NULL, NULL, NULL, 'processing');

UPDATE knowledge_items SET url = 'https://www.homedepot.com/bathroom-tiles' WHERE id = '2';
UPDATE knowledge_items SET url = 'https://www.familyhandyman.com/plumbing-repairs' WHERE id = '5';

-- Insert tags
INSERT INTO tags (item_id, tag) VALUES
  ('1', 'kitchen'), ('1', 'renovation'), ('1', 'guide'),
  ('2', 'bathroom'), ('2', 'tiles'), ('2', 'materials'),
  ('3', 'electrical'), ('3', 'wiring'), ('3', 'safety'),
  ('4', 'living room'), ('4', 'budget'), ('4', 'farmhouse'),
  ('5', 'plumbing'), ('5', 'diy'), ('5', 'repairs');

-- Insert processing metadata
INSERT INTO processing_metadata (id, item_id, chunk_size, token_count, processing_time, sentiment, complexity) VALUES
  ('meta_1', '1', 750, 2500, 2300, 'positive', 'medium'),
  ('meta_2', '2', 500, 1200, 1500, 'neutral', 'low'),
  ('meta_3', '3', 800, 1800, 1900, 'neutral', 'high'),
  ('meta_4', '4', 600, 1000, 1200, 'positive', 'medium'),
  ('meta_5', '5', 650, 1500, 1700, 'neutral', 'medium');
```

### 3. R2 Bucket Configuration
```javascript
// Bucket name: knowledge-base-files
// Structure:
// /documents/{item_id}/original.{ext}
// /thumbnails/{item_id}/thumb.{ext}
// /processed/{item_id}/chunks.json
```

### 4. Vectorize Configuration
```javascript
// Index name: knowledge-embeddings
// Dimensions: 384 (using @cf/baai/bge-base-en-v1.5)
// Metadata fields: item_id, title, type, chunk_index
```

## Worker Implementation

### Basic Worker Structure
```javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route handling
      if (path === '/api/ingest' && request.method === 'POST') {
        return handleIngest(request, env, corsHeaders);
      }
      
      if (path === '/api/knowledge' && request.method === 'GET') {
        return handleGetKnowledge(env, corsHeaders);
      }
      
      if (path.startsWith('/api/knowledge/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        return handleDeleteKnowledge(id, env, corsHeaders);
      }
      
      if (path === '/api/search' && request.method === 'GET') {
        const query = url.searchParams.get('q');
        return handleSearch(query, env, corsHeaders);
      }
      
      if (path === '/api/visualizations' && request.method === 'GET') {
        return handleGetVisualizations(env, corsHeaders);
      }
      
      if (path === '/api/chat' && request.method === 'POST') {
        return handleChat(request, env, corsHeaders);
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleIngest(request, env, headers) {
  const data = await request.json();
  const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate embeddings
  const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: data.content || data.title
  });
  
  // Store in D1
  await env.DB.prepare(
    'INSERT INTO knowledge_items (id, type, title, content, url, file_type, size) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, data.type, data.title, data.content, data.url || null, data.fileType || null, data.size || null).run();
  
  // Store embeddings in Vectorize
  await env.VECTORIZE.insert([{
    id: id,
    values: embeddings.data[0],
    metadata: { item_id: id, title: data.title, type: data.type }
  }]);
  
  // Add tags if provided
  if (data.tags && data.tags.length > 0) {
    for (const tag of data.tags) {
      await env.DB.prepare('INSERT INTO tags (item_id, tag) VALUES (?, ?)')
        .bind(id, tag).run();
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    id: id,
    embeddings_generated: true
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

async function handleGetKnowledge(env, headers) {
  const { results } = await env.DB.prepare(`
    SELECT k.*, GROUP_CONCAT(t.tag) as tags
    FROM knowledge_items k
    LEFT JOIN tags t ON k.id = t.item_id
    GROUP BY k.id
    ORDER BY k.added_at DESC
  `).all();
  
  const items = results.map(item => ({
    ...item,
    tags: item.tags ? item.tags.split(',') : [],
    addedAt: item.added_at
  }));
  
  return new Response(JSON.stringify({ items }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

async function handleDeleteKnowledge(id, env, headers) {
  await env.DB.prepare('DELETE FROM knowledge_items WHERE id = ?').bind(id).run();
  
  // Also delete from Vectorize
  await env.VECTORIZE.deleteByIds([id]);
  
  return new Response(JSON.stringify({
    success: true,
    deleted_id: id
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

async function handleSearch(query, env, headers) {
  if (!query) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
  
  // Generate embedding for query
  const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: query
  });
  
  // Search in Vectorize
  const matches = await env.VECTORIZE.query({
    vector: queryEmbedding.data[0],
    topK: 10
  });
  
  // Get full items from D1
  const results = [];
  for (const match of matches.matches) {
    const { results: items } = await env.DB.prepare(
      'SELECT * FROM knowledge_items WHERE id = ?'
    ).bind(match.id).all();
    
    if (items.length > 0) {
      results.push({
        ...items[0],
        relevance_score: match.score,
        excerpt: items[0].content ? items[0].content.substring(0, 200) + '...' : ''
      });
    }
  }
  
  return new Response(JSON.stringify({ results }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

async function handleGetVisualizations(env, headers) {
  // Get all items
  const { results: items } = await env.DB.prepare('SELECT * FROM knowledge_items').all();
  
  // Get metadata
  const { results: metadata } = await env.DB.prepare('SELECT * FROM processing_metadata').all();
  
  // For real implementation, you would fetch actual embeddings from Vectorize
  // For now, return structured data
  const visualizationData = {
    embeddings: items.map(item => ({
      id: `emb_${item.id}`,
      sourceId: item.id,
      dimensions: 384,
      model: 'text-embedding-ada-002',
      createdAt: item.added_at
    })),
    clusters: [
      {
        id: 'cluster_kitchen',
        name: 'Kitchen & Appliances',
        color: '#FF6B6B',
        confidence: 0.87,
        items: items.filter(i => i.title.toLowerCase().includes('kitchen')).map(i => i.id)
      },
      {
        id: 'cluster_bathroom',
        name: 'Bathroom & Plumbing',
        color: '#4ECDC4',
        confidence: 0.92,
        items: items.filter(i => i.title.toLowerCase().includes('bathroom') || i.title.toLowerCase().includes('plumbing')).map(i => i.id)
      },
      {
        id: 'cluster_electrical',
        name: 'Electrical & Wiring',
        color: '#45B7D1',
        confidence: 0.78,
        items: items.filter(i => i.title.toLowerCase().includes('electrical')).map(i => i.id)
      }
    ],
    metadata: metadata,
    knowledgeGraph: {
      nodes: items.map(item => ({
        id: item.id,
        label: item.title,
        type: 'source',
        size: 15,
        color: '#E3F2FD'
      })),
      links: []
    },
    stats: {
      totalVectors: items.length,
      avgSimilarity: 0.75,
      clusterCount: 3,
      processingEfficiency: 0.85
    }
  };
  
  return new Response(JSON.stringify(visualizationData), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

async function handleChat(request, env, headers) {
  const { message } = await request.json();
  
  // Generate embedding for the question
  const questionEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: message
  });
  
  // Find relevant documents
  const matches = await env.VECTORIZE.query({
    vector: questionEmbedding.data[0],
    topK: 5
  });
  
  // Get content from D1
  const relevantContent = [];
  const sources = [];
  
  for (const match of matches.matches) {
    const { results } = await env.DB.prepare(
      'SELECT title, content FROM knowledge_items WHERE id = ?'
    ).bind(match.id).all();
    
    if (results.length > 0) {
      relevantContent.push(results[0].content || results[0].title);
      sources.push(results[0].title);
    }
  }
  
  // Build context
  const context = relevantContent.join('\n\n');
  
  // Generate response using LLM
  const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    prompt: `You are a helpful home improvement assistant. Based on the following knowledge base content, answer the user's question.
    
    Knowledge Base Content:
    ${context}
    
    User Question: ${message}
    
    Provide a helpful, accurate answer based on the knowledge base content. If the question is about why they should choose this service, highlight the benefits and advantages mentioned in the knowledge base.`,
    max_tokens: 500
  });
  
  return new Response(JSON.stringify({
    answer: aiResponse.response,
    sources: sources,
    confidence: matches.matches[0]?.score || 0,
    processing_time: Date.now() % 1000
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
```

## Frontend Service Updates

### Updated api.ts
```typescript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api'
  : 'http://localhost:8787/api'; // For local development with wrangler

export async function submitIngestion(data: FormData): Promise<SubmissionResult> {
  try {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: result.success,
      jobId: result.id,
    };
  } catch (error) {
    console.error('Ingestion submission failed:', error);
    return {
      success: false,
      errors: [{
        type: 'general',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }],
    };
  }
}
```

### Updated knowledgeService.ts
```typescript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api'
  : 'http://localhost:8787/api';

export async function getKnowledgeItems(): Promise<KnowledgeItem[]> {
  const response = await fetch(`${API_BASE}/knowledge`);
  const data = await response.json();
  return data.items;
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  const items = await getKnowledgeItems();
  
  return {
    totalItems: items.length,
    files: items.filter(item => item.type === 'file').length,
    links: items.filter(item => item.type === 'link').length,
    contexts: items.filter(item => item.type === 'context').length,
    totalSize: items.reduce((total, item) => total + (item.size || 0), 0)
  };
}

export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/knowledge/${id}`, {
    method: 'DELETE'
  });
  return response.ok;
}

export async function searchKnowledgeItems(query: string): Promise<KnowledgeItem[]> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results;
}
```

### Updated visualizationService.ts
```typescript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api'
  : 'http://localhost:8787/api';

export async function getVisualizationData(items: KnowledgeItem[]): Promise<VisualizationData> {
  const response = await fetch(`${API_BASE}/visualizations`);
  return response.json();
}
```

## Implementation Steps

### Phase 1: Setup (Day 1)
1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`
3. Create new Worker project in a `worker` subdirectory
4. Configure wrangler.toml with D1, R2, and Vectorize bindings

### Phase 2: Database Setup (Day 1)
1. Create D1 database: `wrangler d1 create knowledge-base-db`
2. Apply schema using migrations
3. Insert test data
4. Test queries locally

### Phase 3: Worker Development (Day 2)
1. Implement basic CRUD endpoints
2. Add CORS support
3. Test with local development server
4. Deploy to Cloudflare Workers

### Phase 4: AI Integration (Day 3)
1. Configure Vectorize index
2. Implement embedding generation
3. Add semantic search functionality
4. Integrate LLM for chat responses

### Phase 5: Frontend Integration (Day 3)
1. Remove all mock data from services
2. Update service files to use Worker endpoints
3. Add environment variables for API URLs
4. Test full integration

### Phase 6: Testing & Optimization (Day 4)
1. Test all endpoints with curl
2. Verify frontend functionality
3. Add error handling
4. Optimize performance

## Testing Commands

### Local Development
```bash
# Start worker locally
cd worker
wrangler dev

# Test endpoint locally
curl http://localhost:8787/api/knowledge
```

### Production Testing
```bash
# Deploy worker
wrangler deploy

# Test production endpoint
curl https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api/knowledge
```

## Environment Variables

### .env.development
```
VITE_API_BASE=http://localhost:8787/api
```

### .env.production
```
VITE_API_BASE=https://knowledge-base-api.YOUR-SUBDOMAIN.workers.dev/api
```

## Cost Estimation

### Cloudflare Free Tier Includes:
- 100,000 Worker requests/day
- 10 MB Worker size
- 1 GB D1 storage
- 10 GB R2 storage
- 100,000 vector dimensions in Vectorize

### Estimated Monthly Costs (Beyond Free Tier):
- Workers: $0.50 per million requests
- D1: $0.75 per GB stored
- R2: $0.015 per GB stored
- Vectorize: $0.04 per million vector dimensions
- AI Gateway: $0.01 per 1,000 requests

## Security Considerations

1. **API Keys**: Store in Worker environment variables
2. **CORS**: Configure for your specific domain in production
3. **Rate Limiting**: Use Cloudflare Rate Limiting rules
4. **Input Validation**: Validate all inputs before processing
5. **Authentication**: Add JWT authentication for production

## Monitoring & Analytics

1. **Cloudflare Analytics**: Built-in request metrics
2. **Worker Analytics**: Performance and error tracking
3. **Custom Logging**: Use Worker's console.log for debugging
4. **Error Tracking**: Integrate with Sentry or similar

## Rollback Plan

If issues occur:
1. Keep original mock services as backup
2. Use feature flags to switch between mock and real API
3. Maintain database backups in R2
4. Document all changes for easy rollback

## Success Metrics

- API response time < 500ms
- 99.9% uptime
- Successful migration of all mock data
- All frontend features working with real backend
- Positive user feedback on performance

## Next Steps After Implementation

1. Add user authentication
2. Implement real file upload to R2
3. Add more AI models for specialized tasks
4. Create admin dashboard for content management
5. Implement analytics dashboard
6. Add webhook support for external integrations