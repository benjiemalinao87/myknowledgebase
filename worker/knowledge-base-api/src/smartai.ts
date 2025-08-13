/**
 * Two-Stage Smart AI System
 * Stage 1: Rule-based context analysis and response structuring
 * Stage 2: AI-enhanced content generation with focused prompts
 */

import { Persona } from './personas';

export interface MessageContext {
  intent: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  requiresPersonalization: boolean;
  suggestedSkills: string[];
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SmartResponse {
  responseType: 'structured' | 'conversational' | 'emergency';
  sections: ResponseSection[];
  callToAction?: string;
  followUpQuestions?: string[];
}

export interface ResponseSection {
  type: 'analysis' | 'recommendation' | 'steps' | 'warning' | 'examples';
  title: string;
  content: string;
  priority: number;
}

// Stage 1: Analyze message context using rules
export function analyzeMessageContext(message: string, persona: Persona): MessageContext {
  const lowerMessage = message.toLowerCase();
  
  // Intent detection
  let intent = 'general_inquiry';
  if (lowerMessage.includes('how to') || lowerMessage.includes('how do')) {
    intent = 'how_to_guide';
  } else if (lowerMessage.includes('why') || lowerMessage.includes('should i')) {
    intent = 'decision_help';
  } else if (lowerMessage.includes('problem') || lowerMessage.includes('broken') || lowerMessage.includes('not working')) {
    intent = 'troubleshooting';
  } else if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('budget')) {
    intent = 'pricing_inquiry';
  } else if (lowerMessage.includes('recommend') || lowerMessage.includes('best') || lowerMessage.includes('suggest')) {
    intent = 'recommendation_request';
  }

  // Category detection based on keywords
  let category = 'general';
  const categories = {
    kitchen: ['kitchen', 'cabinet', 'appliance', 'countertop', 'cooking'],
    bathroom: ['bathroom', 'toilet', 'shower', 'bathtub', 'sink', 'plumbing'],
    electrical: ['electrical', 'wiring', 'outlet', 'switch', 'power', 'electricity'],
    hvac: ['heating', 'cooling', 'hvac', 'furnace', 'air conditioning', 'temperature'],
    flooring: ['floor', 'carpet', 'hardwood', 'tile', 'laminate'],
    exterior: ['roof', 'siding', 'exterior', 'deck', 'patio', 'landscaping'],
    safety: ['safety', 'danger', 'hazard', 'emergency', 'code', 'permit'],
    sales: ['sell', 'customer', 'client', 'objection', 'close', 'negotiate']
  };

  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      category = cat;
      break;
    }
  }

  // Urgency detection
  let urgency: 'low' | 'medium' | 'high' = 'low';
  const urgentWords = ['emergency', 'urgent', 'immediately', 'asap', 'danger', 'leak', 'smoke', 'fire'];
  const mediumWords = ['soon', 'quickly', 'problem', 'broken', 'not working'];
  
  if (urgentWords.some(word => lowerMessage.includes(word))) {
    urgency = 'high';
  } else if (mediumWords.some(word => lowerMessage.includes(word))) {
    urgency = 'medium';
  }

  // Complexity detection
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  const complexWords = ['renovate', 'remodel', 'install', 'replace', 'upgrade', 'system'];
  const moderateWords = ['repair', 'fix', 'improve', 'update'];
  
  if (complexWords.some(word => lowerMessage.includes(word))) {
    complexity = 'complex';
  } else if (moderateWords.some(word => lowerMessage.includes(word))) {
    complexity = 'moderate';
  }

  // Suggested skills based on persona and intent
  const suggestedSkills = persona.skills
    .filter(skill => {
      const skillLower = skill.name.toLowerCase();
      return lowerMessage.includes(skillLower.split(' ')[0]) || 
             intent.includes(skillLower.split(' ')[0]);
    })
    .map(skill => skill.name);

  // Extract keywords
  const keywords = message.split(' ')
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase().replace(/[^\w]/g, ''));

  // Sentiment analysis (basic)
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  const positiveWords = ['good', 'great', 'excellent', 'perfect', 'love', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'broken'];
  
  if (positiveWords.some(word => lowerMessage.includes(word))) {
    sentiment = 'positive';
  } else if (negativeWords.some(word => lowerMessage.includes(word))) {
    sentiment = 'negative';
  }

  return {
    intent,
    category,
    urgency,
    complexity,
    requiresPersonalization: complexity !== 'simple' || urgency === 'high',
    suggestedSkills,
    keywords,
    sentiment
  };
}

// Stage 2: Build smart AI prompt with context
export function buildSmartPrompt(
  message: string,
  context: MessageContext,
  persona: Persona,
  knowledgeBase: string
): string {
  const systemPrompt = `# AI Assistant Configuration

## Your Role
You are ${persona.name}, a ${persona.role} with ${persona.experience}.

## Current Context Analysis
- **Intent**: ${context.intent}
- **Category**: ${context.category}  
- **Urgency**: ${context.urgency}
- **Complexity**: ${context.complexity}
- **User Sentiment**: ${context.sentiment}

## Response Requirements
Based on the context analysis, provide a ${context.urgency === 'high' ? 'URGENT' : 'comprehensive'} response that:

${context.urgency === 'high' ? `
🚨 **EMERGENCY RESPONSE PROTOCOL**
1. Address immediate safety concerns first
2. Provide step-by-step emergency actions
3. Clearly state when to call professionals
4. Include emergency contact guidance
` : ''}

${context.intent === 'how_to_guide' ? `
📋 **HOW-TO GUIDE FORMAT**
1. **Prerequisites** - What they need before starting
2. **Step-by-Step Instructions** - Clear, numbered steps
3. **Safety Warnings** - Important precautions
4. **Pro Tips** - Expert insights for better results
5. **Common Mistakes** - What to avoid
` : ''}

${context.intent === 'pricing_inquiry' ? `
💰 **PRICING GUIDANCE FORMAT**
1. **Cost Factors** - What affects the price
2. **Price Ranges** - Typical costs for different approaches
3. **Value Considerations** - ROI and long-term benefits
4. **Money-Saving Tips** - How to reduce costs
` : ''}

${context.intent === 'troubleshooting' ? `
🔧 **TROUBLESHOOTING PROTOCOL**
1. **Diagnostic Questions** - Help identify the exact problem
2. **Safety Check** - Ensure safe troubleshooting
3. **Step-by-Step Diagnosis** - Systematic problem-solving
4. **Solution Options** - DIY vs professional repair
5. **Prevention** - How to avoid future issues
` : ''}

## Your Expertise Areas
${persona.expertiseAreas.map(area => `- ${area}`).join('\n')}

## Available Skills to Apply
${context.suggestedSkills.length > 0 ? 
  `Focus on these relevant skills:\n${context.suggestedSkills.map(skill => `- ${skill}`).join('\n')}` :
  'Apply any relevant skills from your expertise'}

## Knowledge Base Context
${knowledgeBase ? `Relevant information from our knowledge base:\n${knowledgeBase}` : 'No specific knowledge base context available'}

## Response Style Guidelines - SMS FORMAT
- **Tone**: ${context.sentiment === 'negative' ? 'Empathetic and solution-focused' : 
              context.sentiment === 'positive' ? 'Enthusiastic and encouraging' : 
              'Professional and helpful'}
- **Length**: MAXIMUM 200 TOKENS (SMS-ready) - Be extremely concise
- **Format**: 
  * Use bullet points (•) for lists
  * No persona introductions ("As your expert...")
  * Direct, actionable advice only
  * Maximum 3 key points
- **Emergency**: ${context.urgency === 'high' ? 'Start with 🚨 and safety first' : 'Normal priority'}

## Constraints
${persona.constraints.map(constraint => `- ${constraint}`).join('\n')}

---

**User Question**: "${message}"

**Your Response** (respond DIRECTLY as the expert, no meta-commentary):`;

  return systemPrompt;
}

// Generate response structure based on context
export function generateResponseStructure(context: MessageContext): SmartResponse {
  const sections: ResponseSection[] = [];

  // Emergency responses get special structure
  if (context.urgency === 'high') {
    return {
      responseType: 'emergency',
      sections: [
        {
          type: 'warning',
          title: '🚨 Immediate Safety Actions',
          content: '',
          priority: 1
        },
        {
          type: 'steps',
          title: 'Emergency Steps',
          content: '',
          priority: 2
        },
        {
          type: 'recommendation',
          title: 'When to Call Professionals',
          content: '',
          priority: 3
        }
      ],
      callToAction: 'If this is a true emergency, stop and call emergency services or relevant professionals immediately.'
    };
  }

  // Structure based on intent
  switch (context.intent) {
    case 'how_to_guide':
      sections.push(
        { type: 'analysis', title: 'Project Overview', content: '', priority: 1 },
        { type: 'steps', title: 'Step-by-Step Instructions', content: '', priority: 2 },
        { type: 'warning', title: 'Safety Considerations', content: '', priority: 3 },
        { type: 'examples', title: 'Pro Tips', content: '', priority: 4 }
      );
      break;

    case 'pricing_inquiry':
      sections.push(
        { type: 'analysis', title: 'Cost Factors', content: '', priority: 1 },
        { type: 'recommendation', title: 'Price Ranges', content: '', priority: 2 },
        { type: 'examples', title: 'Value & Savings Tips', content: '', priority: 3 }
      );
      break;

    case 'troubleshooting':
      sections.push(
        { type: 'analysis', title: 'Problem Diagnosis', content: '', priority: 1 },
        { type: 'steps', title: 'Troubleshooting Steps', content: '', priority: 2 },
        { type: 'recommendation', title: 'Solution Options', content: '', priority: 3 }
      );
      break;

    default:
      sections.push(
        { type: 'analysis', title: 'Assessment', content: '', priority: 1 },
        { type: 'recommendation', title: 'Recommendations', content: '', priority: 2 },
        { type: 'steps', title: 'Next Steps', content: '', priority: 3 }
      );
  }

  return {
    responseType: context.urgency === 'high' ? 'emergency' : 
                  context.complexity === 'simple' ? 'structured' : 'conversational',
    sections,
    followUpQuestions: generateFollowUpQuestions(context)
  };
}

// Generate contextual follow-up questions
function generateFollowUpQuestions(context: MessageContext): string[] {
  const questions: string[] = [];

  switch (context.intent) {
    case 'how_to_guide':
      questions.push(
        'What\'s your current skill level with this type of project?',
        'Do you have all the necessary tools and materials?',
        'Would you like specific product recommendations?'
      );
      break;

    case 'pricing_inquiry':
      questions.push(
        'What\'s your target budget range?',
        'Are you considering DIY or hiring professionals?',
        'Do you need financing options or payment plans?'
      );
      break;

    case 'troubleshooting':
      questions.push(
        'How long has this problem been occurring?',
        'Have you tried any solutions already?',
        'Is this affecting other systems in your home?'
      );
      break;

    default:
      questions.push(
        'Would you like more specific guidance for your situation?',
        'Do you have any other related questions?',
        'What\'s your timeline for this project?'
      );
  }

  return questions.slice(0, 3); // Limit to 3 questions
}