/**
 * Date/Time utilities for persona responses
 * Provides context and formatting for AI models to understand temporal references
 */

export interface DateTimeContext {
  current: {
    timestamp: string;
    date: string;
    time: string;
    dayOfWeek: string;
    timezone: string;
    utcOffset: string;
  };
  formatting: {
    examples: string[];
    businessHours: string;
    dateFormats: string[];
  };
}

/**
 * Generate comprehensive date/time context for AI personas
 * @param timezone - User's timezone (default: 'America/Los_Angeles')
 * @param businessHours - Business hours for scheduling (default: '9:00 AM - 5:00 PM')
 */
export function getDateTimeContext(
  timezone: string = 'America/Los_Angeles',
  businessHours: string = '9:00 AM - 5:00 PM'
): DateTimeContext {
  const now = new Date();
  
  // Format options for different date representations
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  };
  
  // Get timezone offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  const parts = formatter.formatToParts(now);
  const tzName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
  
  // Calculate days for relative date examples
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonday = new Date(now);
  const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  
  return {
    current: {
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-US', dateOptions),
      time: now.toLocaleTimeString('en-US', timeOptions),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }),
      timezone: timezone,
      utcOffset: tzName
    },
    formatting: {
      examples: [
        `"tomorrow" = ${tomorrow.toLocaleDateString('en-US', dateOptions)}`,
        `"next week" = ${nextWeek.toLocaleDateString('en-US', dateOptions)}`,
        `"next Monday" = ${nextMonday.toLocaleDateString('en-US', dateOptions)}`,
        `"in 3 days" = ${new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', dateOptions)}`,
        `"January 20th" = January 20, ${now.getFullYear() + (now.getMonth() === 11 ? 1 : 0)}`,
        `"3pm" = 3:00 PM`,
        `"15:30" = 3:30 PM`,
        `"morning" = 9:00 AM - 12:00 PM`,
        `"afternoon" = 12:00 PM - 5:00 PM`,
        `"evening" = 5:00 PM - 8:00 PM`
      ],
      businessHours: businessHours,
      dateFormats: [
        'Thursday, January 16, 2025',
        'January 16, 2025',
        '1/16/2025',
        '2025-01-16',
        '16-Jan-2025'
      ]
    }
  };
}

/**
 * Generate date/time instructions for system prompts
 */
export function getDateTimeInstructions(context: DateTimeContext): string {
  return `
## 📅 DATE & TIME AWARENESS
Current Date/Time: ${context.current.date} at ${context.current.time} (${context.current.utcOffset})
Today is: ${context.current.dayOfWeek}
Timezone: ${context.current.timezone}

### Understanding Date/Time References:
When users mention dates or times, interpret them as follows:
${context.formatting.examples.map(ex => `• ${ex}`).join('\n')}

### Business Hours: ${context.formatting.businessHours}
• Schedule appointments within business hours unless specifically requested otherwise
• For after-hours requests, suggest the next available business day
• Always confirm the exact date and time in your response

### Date Format Examples:
${context.formatting.dateFormats.map(fmt => `• ${fmt}`).join('\n')}

### Important Guidelines:
• Always acknowledge and confirm specific dates/times mentioned by users
• Convert relative dates (tomorrow, next week) to specific dates
• Clarify ambiguous time references (morning vs specific time)
• Consider timezone differences if mentioned
• Validate that requested dates are not in the past
• For scheduling, always provide both date and time
`;
}

/**
 * Validate if a date string represents a future date
 */
export function isFutureDate(dateStr: string, timezone: string = 'America/Los_Angeles'): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Convert both to timezone-aware strings for comparison
    const dateInTz = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    return dateInTz > nowInTz;
  } catch {
    return false;
  }
}

/**
 * Check if a time falls within business hours
 */
export function isWithinBusinessHours(
  timeStr: string,
  businessStart: string = '09:00',
  businessEnd: string = '17:00'
): boolean {
  try {
    const time = new Date(`2000-01-01 ${timeStr}`);
    const start = new Date(`2000-01-01 ${businessStart}`);
    const end = new Date(`2000-01-01 ${businessEnd}`);
    
    return time >= start && time <= end;
  } catch {
    return false;
  }
}

// ========================================
// NATURAL LANGUAGE DATETIME PARSING
// ========================================

export interface ParsedDateTime {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS format
  fullDateTime: string; // YYYY-MM-DD HH:MM:SS format
  confidence: number; // 0-1 confidence score
  timezone?: string;
}

export interface DateTimeParseResult {
  success: boolean;
  startTime?: ParsedDateTime;
  endTime?: ParsedDateTime;
  error?: string;
}

/**
 * Parse natural language datetime expressions
 * Examples: "Monday at 2pm", "next Tuesday at 10:30 AM", "tomorrow at 3:30"
 */
export function parseNaturalDateTime(text: string, timezone: string = 'America/Los_Angeles'): DateTimeParseResult {
  try {
    const normalizedText = text.toLowerCase().trim();
    
    // Extract time first
    const timeResult = extractTime(normalizedText);
    if (!timeResult.success) {
      return { success: false, error: 'Could not parse time from text' };
    }

    // Extract date
    const dateResult = extractDate(normalizedText);
    if (!dateResult.success) {
      return { success: false, error: 'Could not parse date from text' };
    }

    // Combine date and time
    const startDateTime = combineDateTime(dateResult.date!, timeResult.time!);
    const endDateTime = combineDateTime(dateResult.date!, addHour(timeResult.time!));

    return {
      success: true,
      startTime: {
        date: dateResult.date!,
        time: timeResult.time!,
        fullDateTime: startDateTime,
        confidence: Math.min(timeResult.confidence!, dateResult.confidence!),
        timezone
      },
      endTime: {
        date: dateResult.date!,
        time: addHour(timeResult.time!),
        fullDateTime: endDateTime,
        confidence: Math.min(timeResult.confidence!, dateResult.confidence!),
        timezone
      }
    };
  } catch (error) {
    return { success: false, error: `Parse error: ${error}` };
  }
}

/**
 * Extract time from natural language
 */
function extractTime(text: string): { success: boolean; time?: string; confidence?: number } {
  // Common time patterns
  const timePatterns = [
    // 12-hour format with AM/PM
    { regex: /(\d{1,2}):(\d{2})\s*(am|pm)/i, confidence: 0.9 },
    { regex: /(\d{1,2})\s*(am|pm)/i, confidence: 0.8 },
    
    // 24-hour format
    { regex: /(\d{1,2}):(\d{2})(?!\s*(am|pm))/i, confidence: 0.7 },
    
    // Common expressions
    { regex: /noon|12\s*pm/i, confidence: 0.9, fixed: '12:00' },
    { regex: /midnight|12\s*am/i, confidence: 0.9, fixed: '00:00' },
    { regex: /morning/i, confidence: 0.5, fixed: '09:00' },
    { regex: /afternoon/i, confidence: 0.5, fixed: '14:00' },
    { regex: /evening/i, confidence: 0.5, fixed: '18:00' },
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      if (pattern.fixed) {
        return { success: true, time: pattern.fixed + ':00', confidence: pattern.confidence };
      }

      let hour = parseInt(match[1]);
      let minute = match[2] ? parseInt(match[2]) : 0;
      const period = match[3]?.toLowerCase();

      // Convert 12-hour to 24-hour
      if (period) {
        if (period === 'pm' && hour !== 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;
      }

      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      return { success: true, time: timeString, confidence: pattern.confidence };
    }
  }

  return { success: false };
}

/**
 * Extract date from natural language
 */
function extractDate(text: string): { success: boolean; date?: string; confidence?: number } {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Day name patterns
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                     'july', 'august', 'september', 'october', 'november', 'december'];

  // Relative date patterns
  if (text.includes('today')) {
    return { success: true, date: formatDate(today), confidence: 0.9 };
  }
  
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { success: true, date: formatDate(tomorrow), confidence: 0.9 };
  }

  // Next [day] patterns
  const nextDayMatch = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (nextDayMatch) {
    const targetDay = nextDayMatch[1].toLowerCase();
    const targetDate = getNextWeekday(today, dayNames.indexOf(targetDay));
    return { success: true, date: formatDate(targetDate), confidence: 0.8 };
  }

  // This [day] patterns
  const thisDayMatch = text.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (thisDayMatch) {
    const targetDay = thisDayMatch[1].toLowerCase();
    const targetDate = getThisWeekday(today, dayNames.indexOf(targetDay));
    return { success: true, date: formatDate(targetDate), confidence: 0.8 };
  }

  // Specific day names (assume this week or next week)
  for (let i = 0; i < dayNames.length; i++) {
    if (text.includes(dayNames[i])) {
      const targetDate = getNextOccurrence(today, i);
      return { success: true, date: formatDate(targetDate), confidence: 0.7 };
    }
  }

  // Month day patterns (e.g., "August 18th", "August 18")
  const monthDayMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
  if (monthDayMatch) {
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthDayMatch[1].toLowerCase());
    const day = parseInt(monthDayMatch[2]);
    
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      // Assume current year, but if the date has passed, use next year
      let year = currentYear;
      const testDate = new Date(year, monthIndex, day);
      if (testDate < today) {
        year += 1;
      }
      
      const targetDate = new Date(year, monthIndex, day);
      return { success: true, date: formatDate(targetDate), confidence: 0.8 };
    }
  }

  // Numeric date patterns (MM/DD, MM/DD/YYYY)
  const numericDateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (numericDateMatch) {
    const month = parseInt(numericDateMatch[1]) - 1; // 0-indexed
    const day = parseInt(numericDateMatch[2]);
    const year = numericDateMatch[3] ? parseInt(numericDateMatch[3]) : currentYear;
    
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const targetDate = new Date(year, month, day);
      return { success: true, date: formatDate(targetDate), confidence: 0.8 };
    }
  }

  return { success: false };
}

/**
 * Helper functions for natural language parsing
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function combineDateTime(date: string, time: string): string {
  return `${date} ${time}`;
}

function addHour(time: string): string {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getNextWeekday(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const currentDay = from.getDay();
  let daysUntilTarget = targetDay - currentDay;
  
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Next week
  }
  
  result.setDate(from.getDate() + daysUntilTarget);
  return result;
}

function getThisWeekday(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const currentDay = from.getDay();
  const daysUntilTarget = targetDay - currentDay;
  
  result.setDate(from.getDate() + daysUntilTarget);
  return result;
}

function getNextOccurrence(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const currentDay = from.getDay();
  let daysUntilTarget = targetDay - currentDay;
  
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // Next week
  } else if (daysUntilTarget === 0) {
    // Same day - if it's early in the day, use today, otherwise next week
    const currentHour = from.getHours();
    if (currentHour >= 17) { // After 5 PM, assume next week
      daysUntilTarget = 7;
    }
  }
  
  result.setDate(from.getDate() + daysUntilTarget);
  return result;
}

/**
 * Enhanced extraction that combines multiple text sources for appointment parsing
 */
export function extractAppointmentFromConversation(
  aiResponse: string, 
  userMessage: string, 
  conversationHistory: any[],
  timezone: string = 'America/Los_Angeles'
): { success: boolean; startTime?: string; endTime?: string; confidence?: number } {
  // CRITICAL FIX: Parse AI response FIRST (prioritize AI's structured response)
  const aiResult = parseNaturalDateTime(aiResponse, timezone);
  
  if (aiResult.success && aiResult.startTime && aiResult.endTime) {
    return {
      success: true,
      startTime: aiResult.startTime.fullDateTime,
      endTime: aiResult.endTime.fullDateTime,
      confidence: aiResult.startTime.confidence + 0.1 // Higher confidence for AI response
    };
  }

  // Fallback to user message if AI response doesn't contain parseable datetime
  const userResult = parseNaturalDateTime(userMessage, timezone);
  
  if (userResult.success && userResult.startTime && userResult.endTime) {
    return {
      success: true,
      startTime: userResult.startTime.fullDateTime,
      endTime: userResult.endTime.fullDateTime,
      confidence: userResult.startTime.confidence
    };
  }

  // Final fallback: combine all conversation text (old behavior)
  const allText = [
    ...conversationHistory.map(h => `${h.message} ${h.response}`),
    userMessage,
    aiResponse
  ].join(' ');

  const combinedResult = parseNaturalDateTime(allText, timezone);
  
  if (combinedResult.success && combinedResult.startTime && combinedResult.endTime) {
    return {
      success: true,
      startTime: combinedResult.startTime.fullDateTime,
      endTime: combinedResult.endTime.fullDateTime,
      confidence: combinedResult.startTime.confidence - 0.1 // Lower confidence for combined text
    };
  }

  return { success: false };
}