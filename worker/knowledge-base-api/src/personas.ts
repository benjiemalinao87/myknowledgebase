/**
 * Persona Configuration for AI Responses
 * Define different personas with roles, skills, and constraints
 */

export interface Skill {
  name: string;
  description: string;
  steps: string[];
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  experience: string;
  primaryGoal: string;
  communicationStyle: string;
  responsibilities: string[];
  skills: Skill[];
  constraints: string[];
  expertiseAreas: string[];
  personalityTraits: string[];
  successMetrics: string[];
  contextAwareness: string[];
}

// Function to create a persona from DB data
export function createPersonaFromDB(dbPersona: any): Persona {
  return {
    id: dbPersona.id,
    name: dbPersona.name,
    role: dbPersona.role,
    experience: dbPersona.experience || '',
    primaryGoal: dbPersona.primary_goal || 'Provide helpful assistance',
    communicationStyle: dbPersona.communication_style || 'Professional and friendly',
    responsibilities: dbPersona.responsibilities ? JSON.parse(dbPersona.responsibilities) : [dbPersona.role],
    skills: dbPersona.skills ? JSON.parse(dbPersona.skills) : [],
    constraints: dbPersona.constraints ? JSON.parse(dbPersona.constraints) : ['Be helpful and accurate', 'Stay within role boundaries'],
    expertiseAreas: dbPersona.expertise_areas ? JSON.parse(dbPersona.expertise_areas) : [],
    personalityTraits: dbPersona.personality_traits ? JSON.parse(dbPersona.personality_traits) : ['Professional', 'Helpful'],
    successMetrics: dbPersona.success_metrics ? JSON.parse(dbPersona.success_metrics) : ['Customer satisfaction'],
    contextAwareness: dbPersona.context_awareness ? JSON.parse(dbPersona.context_awareness) : ['Industry best practices']
  };
}

// Function to build system prompt from persona
export function buildSystemPrompt(persona: Persona): string {
  return `# PERSONA: ${persona.name}
You are ${persona.name}, a ${persona.role} with ${persona.experience}.

## 🎯 PRIMARY MISSION
${persona.primaryGoal}

## 🧠 PERSONALITY TRAITS & COMMUNICATION STYLE
**Core Traits:** ${persona.personalityTraits.join(', ')}
**Communication Style:** ${persona.communicationStyle}

## 📊 SUCCESS METRICS & GOALS
You measure success by:
${persona.successMetrics.map(metric => `- ${metric}`).join('\n')}

## 🎭 RESPONSIBILITIES & DUTIES
${persona.responsibilities.map(r => `- ${r}`).join('\n')}

## 🚀 AREAS OF EXPERTISE
${persona.expertiseAreas.map(area => `- ${area}`).join('\n')}

## 🌍 CONTEXT AWARENESS
You are aware of and consider:
${persona.contextAwareness.map(context => `- ${context}`).join('\n')}

## ⚡ PROFESSIONAL SKILLS & TECHNIQUES
${persona.skills.map((skill, index) => `
### ${index + 1}. ${skill.name}
**Description:** ${skill.description}
**Process:**
${skill.steps.map((step, i) => `   ${i + 1}. ${step}`).join('\n')}
`).join('\n')}

## 🚫 CONSTRAINTS & BOUNDARIES
${persona.constraints.map(c => `- ${c}`).join('\n')}

## 🎬 EXECUTION INSTRUCTIONS
1. **ALWAYS stay in character as ${persona.name}** - embody their personality traits and communication style
2. **APPLY YOUR SKILLS SYSTEMATICALLY** - Use your professional techniques and processes for every response
3. **LEVERAGE CONTEXT AWARENESS** - Consider market conditions, industry trends, and situational factors
4. **MEASURE BY SUCCESS METRICS** - Aim for outcomes that align with your success criteria
5. **RESPECT ALL CONSTRAINTS** - Never violate your professional boundaries or limitations
6. **USE CONVERSATION HISTORY** - Reference previous interactions for continuity and deeper understanding
7. **BE RESULTS-ORIENTED** - Focus on actionable, valuable guidance that drives toward your primary mission
8. **DEMONSTRATE EXPERTISE** - Show deep knowledge in your areas of specialization
9. **ADAPT TO CONTEXT** - Adjust your approach based on the specific situation and context clues
10. **MAINTAIN CONSISTENCY** - Ensure every response reflects your personality, expertise, and professional standards

IMPORTANT: Every response should demonstrate your expertise, personality traits, context awareness, and systematic application of your professional skills to achieve your success metrics while respecting all constraints.
`;
}