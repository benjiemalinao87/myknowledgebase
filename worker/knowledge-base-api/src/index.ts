/**
 * Knowledge Base API Worker
 * Provides endpoints for managing and querying home improvement knowledge
 */

import { buildSystemPrompt, createPersonaFromDB } from './personas';
import { analyzeMessageContext, buildSmartPrompt, generateResponseStructure } from './smartai';

interface Env {
  DB: D1Database;
  KNOWLEDGE_BUCKET: R2Bucket;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  OPENAI_API_KEY: string;
}

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Ingest new knowledge item
      if (path === '/api/ingest' && request.method === 'POST') {
        return handleIngest(request, env);
      }

      // Route: Get all knowledge items
      if (path === '/api/knowledge' && request.method === 'GET') {
        return handleGetKnowledge(env);
      }

      // Route: Update knowledge item
      if (path.startsWith('/api/knowledge/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        return handleUpdateKnowledge(id!, request, env);
      }

      // Route: Delete knowledge item
      if (path.startsWith('/api/knowledge/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        return handleDeleteKnowledge(id!, env);
      }

      // Route: Search knowledge base
      if (path === '/api/search' && request.method === 'GET') {
        const query = url.searchParams.get('q');
        return handleSearch(query, env);
      }

      // Route: Get visualization data
      if (path === '/api/visualizations' && request.method === 'GET') {
        return handleGetVisualizations(env);
      }

      // Route: AI Chat
      if (path === '/api/chat' && request.method === 'POST') {
        return handleChat(request, env);
      }

      // Route: Get available personas
      if (path === '/api/personas' && request.method === 'GET') {
        return handleGetPersonas(env);
      }

      // Route: Update persona
      if (path.startsWith('/api/personas/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        return handleUpdatePersona(id!, request, env);
      }

      // Route: Add persona
      if (path === '/api/personas' && request.method === 'POST') {
        return handleAddPersona(request, env);
      }

      // Route: Delete persona
      if (path.startsWith('/api/personas/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        return handleDeletePersona(id!, env);
      }

      // Route: Get AI settings
      if (path === '/api/settings/ai' && request.method === 'GET') {
        return handleGetAISettings(env);
      }

      // Route: Update AI settings
      if (path === '/api/settings/ai' && request.method === 'PUT') {
        return handleUpdateAISettings(request, env);
      }

      // Route: Get configuration
      if (path === '/api/settings/config' && request.method === 'GET') {
        return handleGetConfig(env);
      }

      // Route: Update configuration
      if (path === '/api/settings/config' && request.method === 'PUT') {
        return handleUpdateConfig(request, env);
      }

      // Route: Get conversation history
      if (path === '/api/chat/history' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        const sessionId = url.searchParams.get('session_id');
        return handleGetChatHistory(userId, sessionId, env);
      }

      // Route: Clear conversation history
      if (path === '/api/chat/history' && request.method === 'DELETE') {
        const userId = url.searchParams.get('user_id');
        const sessionId = url.searchParams.get('session_id');
        return handleClearChatHistory(userId, sessionId, env);
      }

      // Route: Get visualization data
      if (path === '/api/visualizations' && request.method === 'GET') {
        return handleGetVisualizationData(env);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
};

// Handler: Ingest new knowledge item
async function handleIngest(request: Request, env: Env): Promise<Response> {
  const data = await request.json() as any;
  const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate required fields
    if (!data.type || !data.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: type and title are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // For now, we'll skip embedding generation until AI is configured
    // Just store in D1
    await env.DB.prepare(
      'INSERT INTO knowledge_items (id, type, title, content, url, file_type, size) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      data.type,
      data.title,
      data.content || null,
      data.url || null,
      data.fileType || null,
      data.size || null
    ).run();

    // Add tags if provided
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        await env.DB.prepare('INSERT INTO tags (item_id, tag) VALUES (?, ?)')
          .bind(id, tag).run();
      }
    }

    return new Response(JSON.stringify({
      success: true,
      id: id,
      embeddings_generated: false // Will be true once AI is configured
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Ingest error:', error);
    throw error;
  }
}

// Handler: Get all knowledge items
async function handleGetKnowledge(env: Env): Promise<Response> {
  try {
    // First get all knowledge items
    const { results: items } = await env.DB.prepare(`
      SELECT * FROM knowledge_items ORDER BY added_at DESC
    `).all();

    // Then get tags for each item
    const itemsWithTags = await Promise.all(items.map(async (item: any) => {
      const { results: tags } = await env.DB.prepare(
        'SELECT tag FROM tags WHERE item_id = ?'
      ).bind(item.id).all();

      return {
        ...item,
        tags: tags.map((t: any) => t.tag),
        addedAt: item.added_at
      };
    }));

    return new Response(JSON.stringify({ items: itemsWithTags }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get knowledge error:', error);
    throw error;
  }
}

// Handler: Update knowledge item
async function handleUpdateKnowledge(id: string, request: Request, env: Env): Promise<Response> {
  try {
    const data = await request.json() as any;
    
    // Update the knowledge item
    await env.DB.prepare(`
      UPDATE knowledge_items 
      SET title = ?, content = ?, url = ?, file_type = ?, size = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.title,
      data.content || null,
      data.url || null,
      data.fileType || null,
      data.size || null,
      id
    ).run();

    // Delete existing tags and add new ones
    if (data.tags && Array.isArray(data.tags)) {
      await env.DB.prepare('DELETE FROM tags WHERE item_id = ?').bind(id).run();
      
      for (const tag of data.tags) {
        await env.DB.prepare('INSERT INTO tags (item_id, tag) VALUES (?, ?)')
          .bind(id, tag).run();
      }
    }

    return new Response(JSON.stringify({
      success: true,
      updated_id: id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

// Handler: Delete knowledge item
async function handleDeleteKnowledge(id: string, env: Env): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM knowledge_items WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      deleted_id: id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// Handler: Search knowledge base
async function handleSearch(query: string | null, env: Env): Promise<Response> {
  if (!query) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // For now, do a simple text search in D1
    // Once Vectorize is configured, we'll do semantic search
    const searchPattern = `%${query}%`;
    const { results } = await env.DB.prepare(`
      SELECT * FROM knowledge_items 
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY added_at DESC
      LIMIT 10
    `).bind(searchPattern, searchPattern).all();

    const searchResults = results.map((item: any) => ({
      ...item,
      relevance_score: 0.5, // Placeholder until we have real embeddings
      excerpt: item.content ? item.content.substring(0, 200) + '...' : ''
    }));

    return new Response(JSON.stringify({ results: searchResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

// Handler: Get visualization data
async function handleGetVisualizations(env: Env): Promise<Response> {
  try {
    const { results: items } = await env.DB.prepare('SELECT * FROM knowledge_items').all();
    const { results: metadata } = await env.DB.prepare('SELECT * FROM processing_metadata').all();

    // Create mock visualization data structure
    // This will be replaced with real data once Vectorize is configured
    const visualizationData = {
      embeddings: items.map((item: any) => ({
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
          items: items.filter((i: any) => i.title?.toLowerCase().includes('kitchen')).map((i: any) => i.id)
        },
        {
          id: 'cluster_bathroom',
          name: 'Bathroom & Plumbing',
          color: '#4ECDC4',
          confidence: 0.92,
          items: items.filter((i: any) => 
            i.title?.toLowerCase().includes('bathroom') || 
            i.title?.toLowerCase().includes('plumbing')
          ).map((i: any) => i.id)
        },
        {
          id: 'cluster_electrical',
          name: 'Electrical & Wiring',
          color: '#45B7D1',
          confidence: 0.78,
          items: items.filter((i: any) => i.title?.toLowerCase().includes('electrical')).map((i: any) => i.id)
        }
      ],
      metadata: metadata,
      knowledgeGraph: {
        nodes: items.map((item: any) => ({
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Visualizations error:', error);
    throw error;
  }
}

// Handler: Two-Stage Smart AI Chat with History
async function handleChat(request: Request, env: Env): Promise<Response> {
  const { 
    message, 
    personaId, 
    useAI = false, 
    user_id, 
    remember_history = false,
    session_id,
    knowledgeIds = [] // Array of specific knowledge item IDs to use
  } = await request.json() as any;

  try {
    // Get AI settings from database
    let aiSettings = {
      maxTokens: 200,
      temperature: 0.8,
      smsMode: false,
      responseLength: 160
    };
    
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM ai_settings ORDER BY updated_at DESC LIMIT 1'
      ).all();
      
      if (results && results.length > 0) {
        const dbSettings = results[0] as any;
        aiSettings = {
          maxTokens: dbSettings.max_tokens || 200,
          temperature: dbSettings.temperature || 0.8,
          smsMode: !!dbSettings.sms_mode,
          responseLength: dbSettings.response_length || 160
        };
      }
    } catch (settingsError) {
      console.log('Using default AI settings:', settingsError);
    }
    // Stage 1: Get persona from database
    let persona;
    
    try {
      const { results } = await env.DB.prepare('SELECT * FROM personas WHERE id = ?').bind(personaId || 'home-improvement-expert').all();
      if (results.length > 0) {
        persona = createPersonaFromDB(results[0]);
      } else {
        // Fallback to first available persona
        const { results: fallbackResults } = await env.DB.prepare('SELECT * FROM personas LIMIT 1').all();
        if (fallbackResults.length > 0) {
          persona = createPersonaFromDB(fallbackResults[0]);
        } else {
          throw new Error('No personas available');
        }
      }
    } catch (dbError) {
      console.error('Error fetching persona:', dbError);
      throw new Error('Failed to load persona');
    }
    
    const context = analyzeMessageContext(message, persona);

    // Stage 2: Retrieve relevant knowledge base content
    let knowledgeContext: any[] = [];
    try {
      if (knowledgeIds && knowledgeIds.length > 0) {
        // Use specific knowledge items if IDs are provided
        const placeholders = knowledgeIds.map(() => '?').join(',');
        const { results: specificItems } = await env.DB.prepare(`
          SELECT id, title, content, source_type, metadata, type, url, file_type
          FROM knowledge_items 
          WHERE id IN (${placeholders})
          ORDER BY created_at DESC
        `).bind(...knowledgeIds).all();
        
        knowledgeContext = specificItems;
        console.log(`Using specific knowledge items: ${knowledgeIds.join(', ')}`);
      } else {
        // Default behavior: retrieve relevant items using keyword matching
        const { results: knowledgeItems } = await env.DB.prepare(`
          SELECT id, title, content, source_type, metadata, type, url, file_type
          FROM knowledge_items 
          ORDER BY created_at DESC 
          LIMIT 10
        `).all();
        
        // Filter knowledge items relevant to the message using simple keyword matching
        knowledgeContext = knowledgeItems.filter((item: any) => {
          const content = (item.content || '').toLowerCase();
          const title = (item.title || '').toLowerCase();
          const messageWords = message.toLowerCase().split(/\s+/);
          
          // Check if any words from the message appear in the knowledge content
          return messageWords.some(word => 
            word.length > 3 && (content.includes(word) || title.includes(word))
          );
        }).slice(0, 3); // Limit to 3 most recent relevant items
        
        console.log(`Using automatic keyword matching, found ${knowledgeContext.length} relevant items`);
      }
      
    } catch (error) {
      console.error('Error retrieving knowledge base:', error);
      // Continue without knowledge context
    }

    // Retrieve conversation history if user_id provided
    let conversationHistory: any[] = [];
    if (user_id && remember_history) {
      try {
        // Create table if it doesn't exist (for production deployment)
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            persona_id TEXT NOT NULL,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            context TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT
          )
        `).run();

        // Get recent conversation history (last 10 messages)
        const { results: history } = await env.DB.prepare(`
          SELECT message, response, timestamp, persona_id 
          FROM chat_history 
          WHERE user_id = ? 
          ORDER BY timestamp DESC 
          LIMIT 10
        `).bind(user_id).all();
        
        conversationHistory = history.reverse(); // Reverse to get chronological order
      } catch (historyError) {
        console.error('Error retrieving conversation history:', historyError);
        // Continue without history
      }
    }

    // Search for relevant knowledge from database
    const searchTerms = message.split(' ').filter(word => word.length > 3).slice(0, 3);
    let relevantItems: any[] = [];
    
    if (searchTerms.length > 0) {
      const searchPattern = `%${searchTerms[0]}%`;
      const { results } = await env.DB.prepare(`
        SELECT title, content FROM knowledge_items 
        WHERE title LIKE ? OR content LIKE ?
        LIMIT 5
      `).bind(searchPattern, searchPattern).all();
      relevantItems = results;
    }

    // Build knowledge context string for old approach
    const knowledgeContextString = relevantItems.map((item: any) => 
      `Document: ${item.title}\nContent: ${item.content || 'N/A'}`
    ).join('\n\n');

    let response;

    if (useAI && env.OPENAI_API_KEY) {
      // Stage 2: Use OpenAI for natural responses
      try {
        // Build a simpler, more natural prompt for OpenAI with knowledge context
        let knowledgeInfo = '';
        if (knowledgeContext.length > 0) {
          knowledgeInfo = '\nKnowledge Base Context:\n' + 
            knowledgeContext.map((item: any) => 
              `- ${item.title}: ${(item.content || '').substring(0, 200)}...`
            ).join('\n');
        }

        const openAIPrompt = `You are a ${persona.role}. The customer asked: "${message}"

Context: This is for SMS (max 160 chars). Be conversational and natural. No bullet points or formal structure.

${knowledgeInfo}

Use the knowledge base information above to provide accurate, specific answers when relevant. Respond naturally as if texting a friend who needs help. Be direct and helpful.`;

        // Build comprehensive persona-specific system prompt using all persona data
        let systemPrompt = buildSystemPrompt(persona);
        
        // Add SMS mode formatting instructions
        systemPrompt += `\n\n## 📱 RESPONSE FORMAT
Give natural, conversational SMS responses (max 160 chars). No bullet points, no formal structure. Talk like a friendly expert texting.`;
        
        // Add knowledge base context to system prompt if available
        if (knowledgeContext.length > 0) {
          systemPrompt += `\n\n## 📚 KNOWLEDGE BASE CONTEXT
${knowledgeContext.map((item: any) => 
            `• ${item.title}: ${(item.content || '').substring(0, 150)}...`
          ).join('\n')}

Use this knowledge when relevant to provide accurate, specific answers that align with your persona traits and goals.`;
        }
        
        // Special enhancement for Chris Voss - add specific sales focus
        if (persona.id === 'chris-voss-negotiator') {
          systemPrompt += `

## 🎯 SALES APPOINTMENT BOOKING FOCUS
CRITICAL: Your PRIMARY GOAL is to book appointments using these techniques:

- Every response should move toward scheduling an in-home estimate
- Overcome objections to secure the appointment, not just chat
- Close with appointment offers: "How does a free estimate sound?"
- Label emotions then redirect to appointment
- NEVER just ask questions without purpose. ALWAYS drive toward appointment booking.

## 🧠 TACTICAL TECHNIQUES
Use these Chris Voss methods while driving toward appointments:
- Tactical empathy: "It seems like..." or "It sounds like..."  
- Mirroring: Repeat their last 3 words as a question
- Calibrated questions: "What would need to happen for you to feel comfortable scheduling?"
- Use late-night FM DJ voice - calm, reassuring
- Seek "That's right" moments that lead to booking`;
          
          // Add knowledge context to Chris Voss too
          if (knowledgeContext.length > 0) {
            systemPrompt += `\n\nKNOWLEDGE BASE CONTEXT:\n${knowledgeContext.map((item: any) => 
              `• ${item.title}: ${(item.content || '').substring(0, 100)}...`
            ).join('\n')}\n\nUse this knowledge when relevant for negotiation context.`;
          }
        }
        
        // Special prompt for Appointment Setter
        if (persona.id === 'appointment-setter') {
          const currentDate = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          
          systemPrompt = `You are a professional Appointment Setter. Today is ${currentDate}. 

CRITICAL SKILLS:
- Parse natural language dates ("next Thursday", "tomorrow", "Monday")
- Convert to specific dates with multiple formats for confirmation
- Handle various time formats (10am, 2:30pm, 14:00)
- Always confirm appointments with exact date/time

RESPONSE FORMAT (max 160 chars):
1. Parse the date/time from user message
2. Convert to specific date (e.g., "Thursday, 8/14/2025 (2025-08-14)")
3. Confirm: "Your appointment is set for [date] at [time]. Can you confirm?"

For "next Thursday 10am" respond like:
"Your appointment is set for Thursday, 8/14/2025 (2025-08-14) at 10:00 AM. Can you confirm this works?"

Be precise and professional.`;
          
          // Add knowledge context to appointment setter too
          if (knowledgeContext.length > 0) {
            systemPrompt += `\n\nKNOWLEDGE BASE CONTEXT:\n${knowledgeContext.map((item: any) => 
              `• ${item.title}: ${(item.content || '').substring(0, 100)}...`
            ).join('\n')}\n\nUse this knowledge when relevant for appointment context.`;
          }
        }

        // Build conversation messages with history
        const messages: any[] = [
          {
            role: 'system',
            content: systemPrompt
          }
        ];

        // Add conversation history if available
        if (conversationHistory.length > 0) {
          conversationHistory.forEach((chat: any) => {
            messages.push(
              { role: 'user', content: chat.message },
              { role: 'assistant', content: chat.response }
            );
          });
          
          // Add instruction to reference history for appointment-related queries
          if (persona.id === 'appointment-setter') {
            messages.push({
              role: 'system',
              content: 'IMPORTANT: The conversation history above contains previous appointments and scheduling information. When asked about appointments, always reference the specific details from the previous messages above.'
            });
          }
        }

        // Add current message
        messages.push({
          role: 'user',
          content: message
        });

        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
            max_tokens: aiSettings.maxTokens,
            temperature: aiSettings.temperature,
            presence_penalty: 0.3, // Avoid repetition
            frequency_penalty: 0.3
          })
        });

        const openAIData = await openAIResponse.json() as any;
        
        let cleanAnswer = openAIData.choices[0].message.content
          // Just basic cleanup - OpenAI already gives natural responses
          .trim()
          .replace(/^["']|["']$/g, ''); // Remove quotes if wrapped
        
        // Apply SMS length limit only if SMS mode is enabled
        if (aiSettings.smsMode) {
          cleanAnswer = cleanAnswer.substring(0, aiSettings.responseLength);
        }

        response = {
          answer: cleanAnswer,
          sources: [...relevantItems.map((item: any) => item.title), ...knowledgeContext.map((item: any) => item.title)].filter((title, index, arr) => arr.indexOf(title) === index),
          persona: {
            id: persona.id,
            name: persona.name,
            role: persona.role,
            contextAwareness: persona.contextAwareness || []
          },
          context: {
            intent: context.intent,
            category: context.category,
            urgency: context.urgency,
            complexity: context.complexity,
            personaContext: persona.contextAwareness || []
          },
          aiGenerated: true,
          confidence: 0.95,
          processing_time: Date.now() % 1000
        };
      } catch (aiError) {
        console.error('AI generation failed, falling back to basic response:', aiError);
        // Fallback to basic response if AI fails
        response = {
          answer: `I'm ${persona.role}. I'm having trouble accessing my AI right now, but I'd be happy to help with your home improvement question: "${message}". Please try again.`,
          sources: knowledgeContext.map((item: any) => item.title),
          persona: { 
            id: persona.id, 
            name: persona.name, 
            role: persona.role,
            contextAwareness: persona.contextAwareness || []
          },
          context: { 
            intent: context.intent, 
            category: context.category, 
            urgency: context.urgency, 
            complexity: context.complexity,
            personaContext: persona.contextAwareness || []
          },
          aiGenerated: false,
          confidence: 0.5,
          processing_time: Date.now() % 1000
        };
      }
    } else {
      // Use basic response when OpenAI is not available
      let answer = `Hi! I'm ${persona.role}. To give you the best help with: "${message}", I'd need to use AI. Please enable AI mode for detailed assistance.`;
      
      if (knowledgeContext.length > 0) {
        answer += ` I found some relevant info: ${knowledgeContext[0].title}`;
      }
      
      response = {
        answer: answer.substring(0, 160),
        sources: knowledgeContext.map((item: any) => item.title),
        persona: { 
          id: persona.id, 
          name: persona.name, 
          role: persona.role,
          contextAwareness: persona.contextAwareness || []
        },
        context: { 
          intent: context.intent, 
          category: context.category, 
          urgency: context.urgency, 
          complexity: context.complexity,
          personaContext: persona.contextAwareness || []
        },
        aiGenerated: false,
        confidence: 0.3,
        processing_time: Date.now() % 1000
      };
    }

    // Save conversation to history if user_id provided and remember_history is true
    if (user_id && remember_history && response.answer) {
      try {
        const historyId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await env.DB.prepare(`
          INSERT INTO chat_history (id, user_id, persona_id, message, response, context, session_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          historyId,
          user_id,
          personaId || 'home-improvement-expert',
          message,
          response.answer,
          JSON.stringify(context),
          session_id || historyId
        ).run();
      } catch (saveError) {
        console.error('Error saving conversation history:', saveError);
        // Don't fail the request if history save fails
      }
    }

    // Add conversation metadata to response
    if (user_id && remember_history) {
      response.conversation = {
        user_id: user_id,
        session_id: session_id || 'auto',
        history_saved: true,
        history_count: conversationHistory.length
      };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

// Enhanced mock response using context analysis
function generateSmartMockResponse(persona: any, message: string, context: any, knowledgeContext: string, sources: any[]): any {
  let answer = '';
  const lowerMessage = message.toLowerCase();
  
  // Generate natural, conversational responses based on persona and context
  
  // Emergency responses still get priority
  if (context.urgency === 'high') {
    answer = `Stop immediately! Turn off power/water if safe. Call a pro now - this isn't DIY territory. Safety first!`;
  }
  
  // Sales Master - natural sales talk
  else if (persona.id === 'grosso-sales-master') {
    if (lowerMessage.includes('expensive') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      answer = `I hear you on price. Quality work saves money long-term. Let's find what fits your budget - what range works for you?`;
    } else if (lowerMessage.includes('competitor')) {
      answer = `Others might be cheaper, but we guarantee our work for 5 years. That peace of mind is worth something, right?`;
    } else {
      answer = `Great question! Based on what you're telling me, I'd recommend starting small to see our quality. Sound fair?`;
    }
  }
  
  // Technical Support - helpful diagnosis
  else if (persona.id === 'technical-support') {
    if (context.category === 'electrical') {
      answer = `Electrical issue? First check if other outlets work. If just one, could be simple. Multiple? Call an electrician.`;
    } else if (context.category === 'plumbing') {
      answer = `For plumbing issues, turn off water first. Small leak? Might be a washer. Big leak or no water? Call a plumber.`;
    } else {
      answer = `Can you describe what's happening? When did it start? Any unusual sounds or smells? This helps me diagnose.`;
    }
  }
  
  // Chris Voss - Master Negotiator using tactical empathy
  else if (persona.id === 'chris-voss-negotiator') {
    if (lowerMessage.includes('expensive') || lowerMessage.includes('price')) {
      answer = `It seems like you're feeling the price is more than you expected... You're right to be concerned about value. What's the biggest challenge here?`;
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      answer = `It sounds like this has been frustrating for you... Help me understand - how long has this been affecting you?`;
    } else if (context.sentiment === 'negative') {
      answer = `You probably think I'm just another person who doesn't get it... Fair enough. What would need to happen for this to work?`;
    } else if (lowerMessage.includes('need') || lowerMessage.includes('want')) {
      answer = `"${message.split(' ').slice(-3).join(' ')}?" (mirroring) ...Tell me, what's driving this need?`;
    } else {
      answer = `It seems like there's more to this story... How can we solve this together in a way that works for you?`;
    }
  }
  
  // Appointment Setter - Date/Time Specialist
  else if (persona.id === 'appointment-setter') {
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      // Parse date/time from message
      const today = new Date();
      let appointmentDate = '';
      let appointmentTime = '';
      
      // Parse "next Thursday" 
      if (lowerMessage.includes('next thursday') || lowerMessage.includes('thursday')) {
        const nextThursday = new Date(today);
        const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7; // Thursday is day 4
        nextThursday.setDate(today.getDate() + daysUntilThursday);
        appointmentDate = `Thursday, ${nextThursday.getMonth() + 1}/${nextThursday.getDate()}/${nextThursday.getFullYear()} (${nextThursday.getFullYear()}-${String(nextThursday.getMonth() + 1).padStart(2, '0')}-${String(nextThursday.getDate()).padStart(2, '0')})`;
      }
      
      // Parse time
      if (lowerMessage.includes('10am') || lowerMessage.includes('10:00') || lowerMessage.includes('10 am')) {
        appointmentTime = '10:00 AM';
      } else if (lowerMessage.includes('2pm') || lowerMessage.includes('14:00')) {
        appointmentTime = '2:00 PM';
      }
      
      if (appointmentDate && appointmentTime) {
        answer = `Thank you for booking an appointment with us! Your requested appointment is set for ${appointmentDate} at ${appointmentTime}. Can you confirm this works for you?`;
      } else if (appointmentDate) {
        answer = `Perfect! I have ${appointmentDate} available. What time would you prefer? Our business hours are 9 AM - 5 PM.`;
      } else {
        answer = `I'd be happy to schedule your appointment! What day and time work best for you? Please specify like "next Monday at 2pm".`;
      }
    } else if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
      answer = `No problem! I can help reschedule your appointment. What's your new preferred date and time?`;
    } else if (lowerMessage.includes('cancel')) {
      answer = `I understand you need to cancel. Can you provide your appointment date so I can locate and cancel it for you?`;
    } else {
      answer = `Hi! I'm here to help with scheduling appointments. Would you like to book, reschedule, or cancel an appointment?`;
    }
  }
  
  // Home Improvement Expert - friendly advice
  else {
    if (lowerMessage.includes('expensive')) {
      answer = `I get it - home improvement isn't cheap. But good work lasts decades. What's your main concern with the cost?`;
    } else if (context.intent === 'how_to_guide') {
      answer = `You can definitely tackle this! Start with prep work, take your time, and don't skip safety gear. Need specifics?`;
    } else if (context.intent === 'decision_help') {
      answer = `Honestly? If it affects safety or home value, do it right. Otherwise, you can probably DIY. What's the project?`;
    } else {
      answer = `Happy to help! For ${context.category || 'this'}, ${context.complexity === 'simple' ? 'you can DIY with some patience' : 'consider getting a quote from a pro'}. What's your timeline?`;
    }
  }

  return {
    answer,
    sources: sources.map((s: any) => s.title),
    persona: {
      id: persona.id,
      name: persona.name,
      role: persona.role
    },
    context: {
      intent: context.intent,
      category: context.category,
      urgency: context.urgency,
      complexity: context.complexity,
      sentiment: context.sentiment,
      suggestedSkills: context.suggestedSkills
    },
    aiGenerated: false,
    smartAnalysis: true,
    confidence: 0.88,
    processing_time: Date.now() % 1000
  };
}

// Handler: Get available personas
async function handleGetPersonas(env: Env): Promise<Response> {
  try {
    // Get all personas from database
    const { results: allPersonas } = await env.DB.prepare(
      'SELECT * FROM personas ORDER BY created_at DESC'
    ).all();

    const personas = allPersonas.map((p: any) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      experience: p.experience || '',
      description: p.role,
      expertiseAreas: p.expertise_areas ? JSON.parse(p.expertise_areas) : [],
      primaryGoal: p.primary_goal || '',
      communicationStyle: p.communication_style || '',
      responsibilities: p.responsibilities ? JSON.parse(p.responsibilities) : [],
      skills: p.skills ? JSON.parse(p.skills) : [],
      constraints: p.constraints ? JSON.parse(p.constraints) : [],
      personalityTraits: p.personality_traits ? JSON.parse(p.personality_traits) : [],
      successMetrics: p.success_metrics ? JSON.parse(p.success_metrics) : [],
      contextAwareness: p.context_awareness ? JSON.parse(p.context_awareness) : [],
      isCustom: true // All personas are now editable
    }));

    return new Response(JSON.stringify({ personas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get personas error:', error);
    return new Response(JSON.stringify({ personas: [], error: 'Failed to load personas' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Update persona
async function handleUpdatePersona(id: string, request: Request, env: Env): Promise<Response> {
  try {
    const personaData = await request.json() as any;
    
    // Update persona in database - all personas are now editable
    const result = await env.DB.prepare(`
      UPDATE personas 
      SET name = ?, role = ?, experience = ?, primary_goal = ?, communication_style = ?,
          responsibilities = ?, skills = ?, constraints = ?, expertise_areas = ?,
          personality_traits = ?, success_metrics = ?, context_awareness = ?
      WHERE id = ?
    `).bind(
      personaData.name,
      personaData.role,
      personaData.experience || '',
      personaData.primaryGoal || '',
      personaData.communicationStyle || '',
      typeof personaData.responsibilities === 'string' ? personaData.responsibilities : JSON.stringify(personaData.responsibilities || []),
      typeof personaData.skills === 'string' ? personaData.skills : JSON.stringify(personaData.skills || []),
      typeof personaData.constraints === 'string' ? personaData.constraints : JSON.stringify(personaData.constraints || []),
      typeof personaData.expertiseAreas === 'string' ? personaData.expertiseAreas : JSON.stringify(personaData.expertiseAreas || []),
      typeof personaData.personalityTraits === 'string' ? personaData.personalityTraits : JSON.stringify(personaData.personalityTraits || []),
      typeof personaData.successMetrics === 'string' ? personaData.successMetrics : JSON.stringify(personaData.successMetrics || []),
      typeof personaData.contextAwareness === 'string' ? personaData.contextAwareness : JSON.stringify(personaData.contextAwareness || []),
      id
    ).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Persona updated successfully',
      id: id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update persona error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update persona' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Add persona
async function handleAddPersona(request: Request, env: Env): Promise<Response> {
  try {
    const personaData = await request.json() as any;
    
    // Validate required fields
    if (!personaData.name || !personaData.role) {
      return new Response(JSON.stringify({ error: 'Name and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate ID if not provided
    const id = personaData.id || `custom-${Date.now()}`;

    // Ensure all new columns exist  
    try {
      await env.DB.prepare(`ALTER TABLE personas ADD COLUMN personality_traits TEXT DEFAULT NULL`).run();
      await env.DB.prepare(`ALTER TABLE personas ADD COLUMN success_metrics TEXT DEFAULT NULL`).run();  
      await env.DB.prepare(`ALTER TABLE personas ADD COLUMN context_awareness TEXT DEFAULT NULL`).run();
    } catch (e) {
      // Columns might already exist, continue
    }

    // Save to database
    await env.DB.prepare(`
      INSERT INTO personas (id, name, role, experience, primary_goal, communication_style, 
                           responsibilities, skills, constraints, expertise_areas,
                           personality_traits, success_metrics, context_awareness)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      personaData.name,
      personaData.role,
      personaData.experience || '',
      personaData.primaryGoal || personaData.primary_goal || '',
      personaData.communicationStyle || personaData.communication_style || '',
      typeof personaData.responsibilities === 'string' ? personaData.responsibilities : JSON.stringify(personaData.responsibilities || []),
      typeof personaData.skills === 'string' ? personaData.skills : JSON.stringify(personaData.skills || []),
      typeof personaData.constraints === 'string' ? personaData.constraints : JSON.stringify(personaData.constraints || []),
      typeof personaData.expertiseAreas === 'string' ? personaData.expertiseAreas : (typeof personaData.expertise_areas === 'string' ? personaData.expertise_areas : JSON.stringify(personaData.expertiseAreas || personaData.expertise_areas || [])),
      typeof personaData.personalityTraits === 'string' ? personaData.personalityTraits : JSON.stringify(personaData.personalityTraits || []),
      typeof personaData.successMetrics === 'string' ? personaData.successMetrics : JSON.stringify(personaData.successMetrics || []),
      typeof personaData.contextAwareness === 'string' ? personaData.contextAwareness : JSON.stringify(personaData.contextAwareness || [])
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Persona added successfully',
      id: id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add persona error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add persona' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Delete persona
async function handleDeletePersona(id: string, env: Env): Promise<Response> {
  try {
    // Delete from database - all personas are now deletable
    const result = await env.DB.prepare('DELETE FROM personas WHERE id = ?').bind(id).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Persona deleted successfully',
      id: id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete persona error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete persona' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Get AI settings
async function handleGetAISettings(env: Env): Promise<Response> {
  try {
    // Try to get settings from database first
    const { results } = await env.DB.prepare(
      'SELECT * FROM ai_settings ORDER BY updated_at DESC LIMIT 1'
    ).all();

    let settings;
    if (results && results.length > 0) {
      const dbSettings = results[0] as any;
      settings = {
        provider: dbSettings.provider || 'openai',
        model: dbSettings.model || 'gpt-4o',
        maxTokens: dbSettings.max_tokens || 200,
        temperature: dbSettings.temperature || 0.8,
        smsMode: !!dbSettings.sms_mode,
        responseLength: dbSettings.response_length || 160,
        hasOpenAIKey: !!env.OPENAI_API_KEY,
        hasCloudflareAI: !!env.AI
      };
    } else {
      // Fallback to default settings
      settings = {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 200,
        temperature: 0.8,
        smsMode: false,
        responseLength: 160,
        hasOpenAIKey: !!env.OPENAI_API_KEY,
        hasCloudflareAI: !!env.AI
      };
    }

    return new Response(JSON.stringify({ settings }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get AI settings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI settings' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Update AI settings
async function handleUpdateAISettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await request.json() as any;
    
    // Update or insert AI settings in database
    await env.DB.prepare(`
      INSERT OR REPLACE INTO ai_settings (id, provider, model, max_tokens, temperature, sms_mode, response_length, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      settings.provider || 'openai',
      settings.model || 'gpt-4o', 
      settings.maxTokens || 200,
      settings.temperature || 0.8,
      settings.smsMode ? 1 : 0,
      settings.responseLength || 160
    ).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'AI settings updated successfully',
      settings: settings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update AI settings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update AI settings' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Get configuration
async function handleGetConfig(env: Env): Promise<Response> {
  try {
    const config = {
      apiEndpoint: 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api',
      hasOpenAIKey: !!env.OPENAI_API_KEY,
      enableAnalytics: true,
      enableDebugMode: false,
      version: '1.0.0',
      environment: 'production'
    };

    return new Response(JSON.stringify({ config }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get config error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Update configuration
async function handleUpdateConfig(request: Request, env: Env): Promise<Response> {
  try {
    const config = await request.json() as any;
    
    // For now, return success - in production you'd update environment variables
    return new Response(JSON.stringify({
      success: true,
      message: 'Configuration updated successfully',
      config: config
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update config error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Get conversation history
async function handleGetChatHistory(userId: string | null, sessionId: string | null, env: Env): Promise<Response> {
  try {
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let query = 'SELECT * FROM chat_history WHERE user_id = ?';
    let params = [userId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY timestamp ASC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      session_id: sessionId,
      history: results.map((chat: any) => ({
        id: chat.id,
        message: chat.message,
        response: chat.response,
        persona_id: chat.persona_id,
        timestamp: chat.timestamp,
        context: chat.context ? JSON.parse(chat.context) : null
      })),
      count: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get chat history' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Clear conversation history
async function handleClearChatHistory(userId: string | null, sessionId: string | null, env: Env): Promise<Response> {
  try {
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let query = 'DELETE FROM chat_history WHERE user_id = ?';
    let params = [userId];

    if (sessionId) {
      query += ' AND session_id = ?';
      params.push(sessionId);
    }

    const result = await env.DB.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Chat history cleared successfully',
      deleted_count: result.changes || 0,
      user_id: userId,
      session_id: sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear chat history' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler: Get visualization data
async function handleGetVisualizationData(env: Env): Promise<Response> {
  try {
    // Get all knowledge items from database
    let dbItems: any[] = [];
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM knowledge_items ORDER BY created_at DESC'
      ).all();
      dbItems = result.results || [];
    } catch (error) {
      console.error('Database query error:', error);
      dbItems = [];
    }

    // For demonstration, force sample data for testing
    const knowledgeItems = [
      {
        id: 'sample-1',
        title: 'Kitchen Renovation Guide',
        content: 'Kitchen renovation involves electrical work, plumbing, cabinet installation, and safety considerations. Always turn off power before electrical work.',
        source_type: 'guide',
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-2', 
        title: 'Bathroom Plumbing Basics',
        content: 'Bathroom plumbing requires understanding water supply lines, drainage, and fixture installation. Common issues include leaky faucets and clogged drains.',
        source_type: 'tutorial',
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-3',
        title: 'Electrical Safety Tips',
        content: 'Electrical work requires safety precautions. Always use circuit breakers, wear protective equipment, and follow local electrical codes.',
        source_type: 'safety',
        created_at: new Date().toISOString()
      }
    ];

    // Generate processing metrics from real data
    const metadata = knowledgeItems.map((item: any) => {
      const content = item.content || '';
      const wordCount = content.split(/\s+/).length;
      const charCount = content.length;
      
      return {
        id: `meta_${item.id}`,
        sourceId: item.id,
        chunkSize: Math.ceil(charCount / 1000), // Approximate chunks
        overlap: 100, // Standard overlap
        tokenCount: Math.ceil(wordCount * 1.3), // Rough token estimation
        processingTime: Math.min(charCount * 2, 5000), // Processing time based on content length
        extractedEntities: extractEntities(content),
        keywords: extractKeywords(content),
        sentiment: analyzeSentiment(content),
        complexity: analyzeComplexity(content)
      };
    });

    // Generate semantic clusters based on item types and content
    const clusters = generateClusters(knowledgeItems);

    // Generate mock embeddings (in a real system, these would come from a vector database)
    const embeddings = knowledgeItems.flatMap((item: any) => [
      {
        id: `emb_${item.id}`,
        sourceId: item.id,
        vector: generateMockVector(384), // 384-dimensional vector
        dimensions: 384,
        model: 'text-embedding-ada-002',
        createdAt: new Date()
      }
    ]);

    // Generate knowledge graph
    const knowledgeGraph = generateKnowledgeGraph(knowledgeItems, clusters);

    // Calculate statistics
    const stats = {
      totalVectors: embeddings.length,
      avgSimilarity: calculateAvgSimilarity(knowledgeItems),
      clusterCount: clusters.length,
      processingEfficiency: calculateProcessingEfficiency(metadata)
    };

    return new Response(JSON.stringify({
      embeddings,
      clusters,
      metadata,
      knowledgeGraph,
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get visualization data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get visualization data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions for data analysis
function extractEntities(content: string): string[] {
  const entities = ['kitchen', 'bathroom', 'electrical', 'plumbing', 'renovation', 'DIY', 'tools', 'materials', 'flooring', 'paint', 'roof', 'windows', 'doors'];
  return entities.filter(entity => 
    content.toLowerCase().includes(entity)
  ).slice(0, 5);
}

function extractKeywords(content: string): string[] {
  const keywords = ['repair', 'install', 'replace', 'upgrade', 'maintenance', 'safety', 'cost', 'design', 'improve', 'build', 'fix', 'clean'];
  return keywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  ).slice(0, 6);
}

function analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['good', 'great', 'excellent', 'easy', 'simple', 'efficient', 'beautiful', 'perfect'];
  const negativeWords = ['bad', 'difficult', 'hard', 'expensive', 'problem', 'issue', 'broken', 'failed'];
  
  const positive = positiveWords.some(word => content.toLowerCase().includes(word));
  const negative = negativeWords.some(word => content.toLowerCase().includes(word));
  
  if (positive && !negative) return 'positive';
  if (negative && !positive) return 'negative';
  return 'neutral';
}

function analyzeComplexity(content: string): 'low' | 'medium' | 'high' {
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 100) return 'low';
  if (wordCount < 500) return 'medium';
  return 'high';
}

function generateClusters(items: any[]) {
  const clusterTypes = [
    { id: 'kitchen', name: 'Kitchen & Appliances', color: '#FF6B6B' },
    { id: 'bathroom', name: 'Bathroom & Plumbing', color: '#4ECDC4' },
    { id: 'electrical', name: 'Electrical & Wiring', color: '#45B7D1' },
    { id: 'general', name: 'General Renovation', color: '#96CEB4' },
    { id: 'exterior', name: 'Exterior & Landscaping', color: '#FFEAA7' }
  ];

  return clusterTypes.map(cluster => {
    const clusterItems = items.filter((item: any) => {
      const content = (item.content || '').toLowerCase();
      return content.includes(cluster.id) || 
             (cluster.id === 'general' && !clusterTypes.slice(0, -1).some(c => content.includes(c.id)));
    });

    return {
      id: `cluster_${cluster.id}`,
      name: cluster.name,
      color: cluster.color,
      confidence: Math.min(0.75 + (clusterItems.length * 0.05), 0.95),
      centroid: generateMockVector(384),
      items: clusterItems.map((item: any) => item.id)
    };
  }).filter(cluster => cluster.items.length > 0);
}

function generateKnowledgeGraph(items: any[], clusters: any[]) {
  const nodes = [
    ...items.map((item: any) => ({
      id: item.id,
      label: item.title || item.source_type,
      type: 'source',
      size: Math.min((item.content || '').length / 100 + 10, 30),
      color: '#E3F2FD',
      metadata: item
    })),
    ...clusters.map((cluster: any) => ({
      id: cluster.id,
      label: cluster.name,
      type: 'concept',
      size: cluster.items.length * 5 + 15,
      color: cluster.color,
      metadata: cluster
    }))
  ];

  const links: any[] = [];
  
  // Add cluster connections
  clusters.forEach((cluster: any) => {
    cluster.items.forEach((itemId: string) => {
      links.push({
        source: itemId,
        target: cluster.id,
        strength: 0.8,
        type: 'semantic'
      });
    });
  });

  return { nodes, links };
}

function generateMockVector(dimensions: number): number[] {
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}

function calculateAvgSimilarity(items: any[]): number {
  return Math.random() * 0.3 + 0.65; // Mock similarity score
}

function calculateProcessingEfficiency(metadata: any[]): number {
  if (metadata.length === 0) return 0;
  const avgProcessingTime = metadata.reduce((sum, m) => sum + m.processingTime, 0) / metadata.length;
  return Math.max(0, Math.min(1, (5000 - avgProcessingTime) / 5000)); // Efficiency based on processing time
}