/**
 * Firecrawl Integration for Web Content Parsing
 * Converts web pages into clean, LLM-ready content
 * Documentation: https://docs.firecrawl.dev
 */

interface FirecrawlResponse {
  success: boolean;
  data?: {
    content: string;
    markdown: string;
    metadata?: {
      title?: string;
      description?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      sourceURL?: string;
    };
    html?: string;
  };
  error?: string;
}

/**
 * Scrape a URL using Firecrawl API
 * Returns clean markdown content ready for LLM consumption
 */
export async function scrapeWithFirecrawl(
  url: string,
  apiKey: string
): Promise<{
  success: boolean;
  title: string;
  content: string;
  markdown: string;
  description: string;
  error?: string;
}> {
  if (!apiKey) {
    return {
      success: false,
      title: url,
      content: '',
      markdown: '',
      description: '',
      error: 'Firecrawl API key not configured'
    };
  }

  try {
    // Firecrawl API endpoint
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        removeBase64Images: true,
        waitFor: 3000, // Wait for dynamic content
        actions: [], // Could add actions like clicking buttons if needed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    const result: FirecrawlResponse = await response.json();

    if (result.success && result.data) {
      const metadata = result.data.metadata || {};
      
      return {
        success: true,
        title: metadata.title || metadata.ogTitle || url,
        content: result.data.content || '',
        markdown: result.data.markdown || '',
        description: metadata.description || metadata.ogDescription || '',
      };
    } else {
      throw new Error(result.error || 'Unknown error from Firecrawl');
    }
  } catch (error: any) {
    console.error('Firecrawl scraping error:', error);
    return {
      success: false,
      title: url,
      content: '',
      markdown: '',
      description: '',
      error: error.message
    };
  }
}

/**
 * Crawl an entire website using Firecrawl
 * Useful for comprehensive knowledge base building
 */
export async function crawlWebsite(
  url: string,
  apiKey: string,
  options?: {
    maxPages?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
  }
): Promise<{
  success: boolean;
  pages: Array<{
    url: string;
    title: string;
    content: string;
    markdown: string;
  }>;
  error?: string;
}> {
  if (!apiKey) {
    return {
      success: false,
      pages: [],
      error: 'Firecrawl API key not configured'
    };
  }

  try {
    // Start crawl job
    const startResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        maxDepth: 3,
        limit: options?.maxPages || 10,
        includePaths: options?.includePatterns || [],
        excludePaths: options?.excludePatterns || [],
        formats: ['markdown'],
        onlyMainContent: true,
      })
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start crawl: ${startResponse.status}`);
    }

    const { id: jobId } = await startResponse.json();

    // Poll for results (in production, use webhooks)
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check crawl status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        return {
          success: true,
          pages: statusData.data.map((page: any) => ({
            url: page.url,
            title: page.metadata?.title || page.url,
            content: page.content || '',
            markdown: page.markdown || ''
          }))
        };
      } else if (statusData.status === 'failed') {
        throw new Error('Crawl job failed');
      }
      
      attempts++;
    }

    throw new Error('Crawl job timed out');
  } catch (error: any) {
    console.error('Firecrawl crawling error:', error);
    return {
      success: false,
      pages: [],
      error: error.message
    };
  }
}

/**
 * Extract structured data from a webpage
 * Useful for extracting specific information like prices, dates, etc.
 */
export async function extractStructuredData(
  url: string,
  apiKey: string,
  schema: Record<string, any>
): Promise<{
  success: boolean;
  data: any;
  error?: string;
}> {
  if (!apiKey) {
    return {
      success: false,
      data: null,
      error: 'Firecrawl API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['extract'],
        extract: {
          schema: schema,
          systemPrompt: 'Extract the data according to the provided schema'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl extraction failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data?.extract) {
      return {
        success: true,
        data: result.data.extract
      };
    } else {
      throw new Error('No structured data extracted');
    }
  } catch (error: any) {
    console.error('Firecrawl extraction error:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}