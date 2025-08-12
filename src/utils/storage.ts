import { FormData } from '../types';

const STORAGE_KEY = 'home-improvement-chatbot-draft';

export function saveDraft(data: FormData): void {
  try {
    // Don't save file objects, just metadata
    const draftData = {
      links: data.links,
      context: data.context,
      fileCount: data.files.length,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
  }
}

export function loadDraft(): Partial<FormData> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      links: parsed.links || [],
      context: parsed.context || '',
      files: [], // Files can't be persisted
    };
  } catch (error) {
    console.warn('Failed to load draft from localStorage:', error);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear draft from localStorage:', error);
  }
}