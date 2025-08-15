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