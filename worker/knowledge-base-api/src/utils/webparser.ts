/**
 * Web Content Parser for Knowledge Base
 * Extracts meaningful content from web pages
 */

/**
 * Fetch and parse web content using Cloudflare's HTMLRewriter
 * This is the most efficient approach for Cloudflare Workers
 */
export async function parseWebContent(url: string): Promise<{
  title: string;
  content: string;
  description: string;
  error?: string;
}> {
  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract content using regex (simple approach)
    // For production, consider using cheerio or readability
    const extracted = extractContentSimple(html);
    
    return extracted;
  } catch (error: any) {
    console.error('Web parsing error:', error);
    return {
      title: url,
      content: '',
      description: '',
      error: error.message
    };
  }
}

/**
 * Simple content extraction using regex
 * Works for most standard websites
 */
function extractContentSimple(html: string): {
  title: string;
  content: string;
  description: string;
} {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  // Extract meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Remove script and style elements
  let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags but keep text
  cleanHtml = cleanHtml.replace(/<[^>]+>/g, ' ');
  
  // Remove extra whitespace
  cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();
  
  // Extract main content (look for article, main, or content areas)
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  ];

  let mainContent = '';
  for (const pattern of contentPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      mainContent = match[1];
      break;
    }
  }

  // If we found specific content area, clean it
  if (mainContent) {
    mainContent = mainContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    mainContent = mainContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    mainContent = mainContent.replace(/<[^>]+>/g, ' ');
    mainContent = mainContent.replace(/\s+/g, ' ').trim();
  } else {
    // Fallback to cleaned full HTML
    mainContent = cleanHtml;
  }

  // Limit content length for storage
  const maxLength = 10000;
  if (mainContent.length > maxLength) {
    mainContent = mainContent.substring(0, maxLength) + '...';
  }

  return {
    title,
    content: mainContent,
    description
  };
}

/**
 * Enhanced extraction using HTMLRewriter (Cloudflare's streaming parser)
 * More efficient for large pages
 */
export function createHTMLRewriter() {
  let content = {
    title: '',
    description: '',
    paragraphs: [] as string[],
    headings: [] as string[]
  };

  return new HTMLRewriter()
    .on('title', {
      text(text) {
        content.title += text.text;
      }
    })
    .on('meta[name="description"]', {
      element(element) {
        content.description = element.getAttribute('content') || '';
      }
    })
    .on('p', {
      text(text) {
        if (text.text.trim()) {
          content.paragraphs.push(text.text.trim());
        }
      }
    })
    .on('h1, h2, h3', {
      text(text) {
        if (text.text.trim()) {
          content.headings.push(text.text.trim());
        }
      }
    })
    .on('script, style, nav, header, footer', {
      element(element) {
        element.remove();
      }
    });
}

/**
 * Use AI to intelligently extract content
 * Best for complex pages but uses AI credits
 */
export async function parseWebContentWithAI(
  url: string, 
  html: string,
  ai: any
): Promise<{
  title: string;
  content: string;
  summary: string;
}> {
  const prompt = `
Extract the main content from this webpage HTML.
URL: ${url}

Return a JSON with:
- title: The page title
- content: The main article/content text (max 1000 words)
- summary: A brief summary (2-3 sentences)

HTML:
${html.substring(0, 5000)}...
`;

  try {
    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt,
      max_tokens: 1500
    });

    return JSON.parse(response.response);
  } catch (error) {
    console.error('AI extraction failed:', error);
    // Fallback to simple extraction
    return {
      title: url,
      content: extractContentSimple(html).content,
      summary: ''
    };
  }
}