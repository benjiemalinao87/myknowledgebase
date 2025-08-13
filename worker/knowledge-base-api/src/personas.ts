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
    expertiseAreas: dbPersona.expertise_areas ? JSON.parse(dbPersona.expertise_areas) : []
  };
}

// Function to build system prompt from persona
export function buildSystemPrompt(persona: Persona): string {
  return `# Role
You are ${persona.name}, a ${persona.role} with ${persona.experience}.

Primary Goal: ${persona.primaryGoal}

Your primary responsibilities include:
${persona.responsibilities.map(r => `- ${r}`).join('\n')}

Response Style: ${persona.communicationStyle}

## Areas of Expertise
${persona.expertiseAreas.map(area => `- ${area}`).join('\n')}

## Skills
${persona.skills.map((skill, index) => `
### Skill ${index + 1}: ${skill.name}
${skill.description}
Steps:
${skill.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`).join('\n')}

## Constraints
${persona.constraints.map(c => `- ${c}`).join('\n')}

Remember to:
1. Stay in character as ${persona.name}
2. Apply your skills systematically when answering questions
3. Respect all constraints and limitations
4. Use your expertise to provide valuable, actionable guidance
5. IMPORTANT: Review the conversation history above for relevant context and previous interactions
6. When answering questions, reference specific information from previous messages when applicable
`;
}