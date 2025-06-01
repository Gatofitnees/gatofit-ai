
import { useState, useCallback } from 'react';

export interface PendingFoodEntry {
  id: string;
  imageUrl: string;
  fileName: string;
  timestamp: string;
  isLoading: boolean;
  error?: string;
}

export const usePendingFoodEntries = () => {
  const [pendingEntries, setPendingEntries] = useState<PendingFoodEntry[]>([]);

  const addPendingEntry = useCallback((imageUrl: string, fileName: string): string => {
    const entryId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: PendingFoodEntry = {
      id: entryId,
      imageUrl,
      fileName,
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    
    setPendingEntries(prev => [newEntry, ...prev]);
    return entryId;
  }, []);

  const updatePendingEntry = useCallback((entryId: string, success: boolean, error?: string) => {
    setPendingEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, isLoading: false, error: error }
          : entry
      )
    );
  }, []);

  const removePendingEntry = useCallback((entryId: string) => {
    setPendingEntries(prev => prev.filter(entry => entry.id !== entryId));
  }, []);

  const clearAllPendingEntries = useCallback(() => {
    setPendingEntries([]);
  }, []);

  return {
    pendingEntries,
    addPendingEntry,
    updatePendingEntry,
    removePendingEntry,
    clearAllPendingEntries
  };
};
