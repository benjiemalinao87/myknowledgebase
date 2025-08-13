import { FormData, SubmissionResult } from '../types';

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8787/api'
  : 'https://knowledge-base-api.benjiemalinao879557.workers.dev/api';

export async function submitIngestion(data: FormData): Promise<SubmissionResult> {
  try {
    const errors: Array<{ type: 'file' | 'link' | 'general'; id?: string; message: string; }> = [];
    const successfulItems: string[] = [];

    // Process files
    for (const fileItem of data.files) {
      try {
        const response = await fetch(`${API_BASE}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'file',
            title: fileItem.file.name,
            content: `File uploaded: ${fileItem.file.name}`,
            fileType: fileItem.file.type || 'unknown',
            size: fileItem.size,
            tags: ['uploaded']
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          successfulItems.push(result.id);
        }
      } catch (error) {
        errors.push({
          type: 'file',
          id: fileItem.id,
          message: error instanceof Error ? error.message : 'Failed to upload file'
        });
      }
    }

    // Process links
    for (const linkItem of data.links) {
      try {
        const response = await fetch(`${API_BASE}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'link',
            title: linkItem.url,
            url: linkItem.url,
            content: `Web link: ${linkItem.url}`,
            tags: ['link']
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          successfulItems.push(result.id);
        }
      } catch (error) {
        errors.push({
          type: 'link',
          id: linkItem.id,
          message: error instanceof Error ? error.message : 'Failed to add link'
        });
      }
    }

    // Process context if provided
    if (data.context && data.context.trim()) {
      try {
        const response = await fetch(`${API_BASE}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'context',
            title: 'User Context',
            content: data.context,
            tags: ['context', 'user-input']
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          successfulItems.push(result.id);
        }
      } catch (error) {
        errors.push({
          type: 'general',
          message: error instanceof Error ? error.message : 'Failed to save context'
        });
      }
    }

    return {
      success: successfulItems.length > 0,
      jobId: successfulItems.length > 0 ? successfulItems[0] : undefined,
      errors: errors.length > 0 ? errors : undefined
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