/**
 * ICS Calendar File Generator Worker
 * Microservice for generating ICS calendar files with timezone support
 */

interface ICSRequest {
  startTime: string;
  endTime: string;
  timezone: string;
  title: string;
  description?: string;
  location?: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

interface ICSResponse {
  success: boolean;
  icsUrl?: string;
  icsContent?: string;
  downloadLink?: string;
  error?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Main ICS generation endpoint
      if (path === '/api/generate-ics' && request.method === 'POST') {
        return handleGenerateICS(request);
      }

      // Download ICS file endpoint  
      if (path.startsWith('/download/') && request.method === 'GET') {
        return handleDownloadICS(path);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          service: 'ics-generator',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleGenerateICS(request: Request): Promise<Response> {
  try {
    const data: ICSRequest = await request.json();

    // Validate required fields
    if (!data.startTime || !data.endTime || !data.timezone || !data.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: startTime, endTime, timezone, title'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate datetime
    const startDateTime = parseDateTime(data.startTime, data.timezone);
    const endDateTime = parseDateTime(data.endTime, data.timezone);

    if (!startDateTime || !endDateTime) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid datetime format or timezone'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (startDateTime >= endDateTime) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Start time must be before end time'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate ICS content
    const icsContent = generateICSContent({
      startDateTime,
      endDateTime,
      timezone: data.timezone,
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      attendeeEmail: data.attendeeEmail || '',
      attendeeName: data.attendeeName || ''
    });

    // Generate unique ID for download URL
    const icsId = generateUniqueId();
    const icsUrl = `${new URL(request.url).origin}/download/${icsId}.ics`;
    
    // Create download link (data URL)
    const downloadLink = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    // Store ICS content (in a real implementation, you might use KV storage)
    // For now, we'll return the content directly
    
    const response: ICSResponse = {
      success: true,
      icsUrl,
      icsContent,
      downloadLink
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generate ICS error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate ICS file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleDownloadICS(path: string): Promise<Response> {
  // Extract filename from path
  const filename = path.split('/').pop();
  
  // In a real implementation, you would fetch from KV storage
  // For now, return a simple response
  const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ICS Generator//EN
BEGIN:VEVENT
UID:${generateUniqueId()}@ics-generator.workers.dev
DTSTAMP:${formatICSDateTime(new Date())}
DTSTART:${formatICSDateTime(new Date())}
DTEND:${formatICSDateTime(new Date(Date.now() + 3600000))}
SUMMARY:Sample Event
DESCRIPTION:This is a sample ICS file
END:VEVENT
END:VCALENDAR`;

  return new Response(sampleICS, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  });
}

function parseDateTime(dateTimeStr: string, timezone: string): Date | null {
  try {
    // Handle different datetime formats
    let parsedDate: Date;

    // Format 1: "2022-08-30 15:30:00"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeStr)) {
      parsedDate = new Date(dateTimeStr.replace(' ', 'T'));
    }
    // Format 2: ISO 8601 "2022-08-30T15:30:00"
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateTimeStr)) {
      parsedDate = new Date(dateTimeStr);
    }
    // Format 3: Unix timestamp
    else if (/^\d{10}$/.test(dateTimeStr)) {
      parsedDate = new Date(parseInt(dateTimeStr) * 1000);
    }
    // Format 4: JavaScript timestamp
    else if (/^\d{13}$/.test(dateTimeStr)) {
      parsedDate = new Date(parseInt(dateTimeStr));
    }
    // Format 5: Date only "2022-08-30" (default to 9 AM)
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateTimeStr)) {
      parsedDate = new Date(dateTimeStr + 'T09:00:00');
    }
    else {
      // Try to parse as-is
      parsedDate = new Date(dateTimeStr);
    }

    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

function generateICSContent(params: {
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  title: string;
  description: string;
  location: string;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const {
    startDateTime,
    endDateTime,
    timezone,
    title,
    description,
    location,
    attendeeEmail,
    attendeeName
  } = params;

  const uid = generateUniqueId();
  const now = new Date();

  // Format dates for ICS (UTC)
  const startUTC = formatICSDateTime(startDateTime);
  const endUTC = formatICSDateTime(endDateTime);
  const createdUTC = formatICSDateTime(now);

  // Generate VTIMEZONE component for the specified timezone
  const vtimezone = generateVTimezone(timezone);

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ICS Generator Worker//ICS Generator//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vtimezone}
BEGIN:VEVENT
UID:${uid}@ics-generator.workers.dev
DTSTAMP:${createdUTC}
CREATED:${createdUTC}
LAST-MODIFIED:${createdUTC}
DTSTART;TZID=${timezone}:${formatICSDateTimeLocal(startDateTime)}
DTEND;TZID=${timezone}:${formatICSDateTimeLocal(endDateTime)}
SUMMARY:${escapeICSText(title)}`;

  if (description) {
    icsContent += `\nDESCRIPTION:${escapeICSText(description)}`;
  }

  if (location) {
    icsContent += `\nLOCATION:${escapeICSText(location)}`;
  }

  if (attendeeEmail && attendeeName) {
    icsContent += `\nATTENDEE;CN=${escapeICSText(attendeeName)}:mailto:${attendeeEmail}`;
  }

  icsContent += `\nSTATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

function formatICSDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatICSDateTimeLocal(date: Date): string {
  // Format as YYYYMMDDTHHMMSS (local time, no Z suffix)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function generateVTimezone(timezone: string): string {
  // Simplified VTIMEZONE - in production, you'd want a more comprehensive timezone database
  const timezoneMap: { [key: string]: string } = {
    'America/Los_Angeles': `BEGIN:VTIMEZONE
TZID:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:20070311T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:20071104T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`,
    'America/Chicago': `BEGIN:VTIMEZONE
TZID:America/Chicago
BEGIN:DAYLIGHT
TZOFFSETFROM:-0600
TZOFFSETTO:-0500
TZNAME:CDT
DTSTART:20070311T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0500
TZOFFSETTO:-0600
TZNAME:CST
DTSTART:20071104T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`,
    'America/New_York': `BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:20070311T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:20071104T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`
  };

  return timezoneMap[timezone] || `BEGIN:VTIMEZONE
TZID:${timezone}
BEGIN:STANDARD
TZOFFSETFROM:-0000
TZOFFSETTO:-0000
TZNAME:UTC
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`;
}

function generateUniqueId(): string {
  return crypto.randomUUID();
}