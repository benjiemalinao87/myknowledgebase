const SUPPORTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 20;

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
    return {
      valid: false,
      error: 'Unsupported file type. Please use PDF, DOCX, TXT, MD, CSV, PNG, or JPG files.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 25MB limit. Current size: ${formatFileSize(file.size)}`,
    };
  }

  return { valid: true };
}

export function validateFiles(files: File[]): { valid: boolean; error?: string } {
  if (files.length > MAX_FILES) {
    return {
      valid: false,
      error: `Too many files. Maximum ${MAX_FILES} files allowed.`,
    };
  }

  return { valid: true };
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}