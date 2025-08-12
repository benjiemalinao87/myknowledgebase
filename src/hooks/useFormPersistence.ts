import { useEffect } from 'react';
import { FormData } from '../types';
import { saveDraft } from '../utils/storage';

export function useFormPersistence(formData: FormData) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.links.length > 0 || formData.context.trim() || formData.files.length > 0) {
        saveDraft(formData);
      }
    }, 1000); // Debounce saving

    return () => clearTimeout(timeoutId);
  }, [formData]);
}