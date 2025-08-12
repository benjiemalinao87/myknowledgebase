export interface FileItem {
  id: string;
  file: File;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface WebLink {
  id: string;
  url: string;
  status: 'pending' | 'validating' | 'success' | 'error';
  error?: string;
}

export interface SubmissionResult {
  success: boolean;
  jobId?: string;
  errors?: Array<{
    type: 'file' | 'link' | 'general';
    id?: string;
    message: string;
  }>;
}

export interface FormData {
  files: FileItem[];
  links: WebLink[];
  context: string;
}

export type SubmissionStatus = 'idle' | 'uploading' | 'crawling' | 'indexing' | 'complete' | 'error';

export interface KnowledgeItem {
  id: string;
  type: 'file' | 'link' | 'context';
  title: string;
  content?: string;
  url?: string;
  fileType?: string;
  size?: number;
  addedAt: Date;
  status: 'active' | 'processing' | 'error';
  tags?: string[];
}

export interface KnowledgeStats {
  totalItems: number;
  files: number;
  links: number;
  contexts: number;
  totalSize: number;
}