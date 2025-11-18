import { useState, useCallback } from 'react';

interface AutoSaveData {
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  categoryId: string;
  contestId: string;
  selectedTags: string[];
  featuredImage: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  timestamp: number;
}

export function useAutoSave(key: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Save data to localStorage
  const save = useCallback((data: Partial<AutoSaveData>) => {
    const saveData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(saveData));
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  }, [key]);

  // Load data from localStorage
  const load = useCallback((): AutoSaveData | null => {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    try {
      const data = JSON.parse(saved);
      // Check if data is less than 7 days old
      if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
      // Clear old data
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('Error loading auto-save data:', error);
      return null;
    }
  }, [key]);

  // Clear saved data
  const clear = useCallback(() => {
    localStorage.removeItem(key);
    setLastSaved(null);
    setHasUnsavedChanges(false);
  }, [key]);

  return {
    save,
    load,
    clear,
    lastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };
}
