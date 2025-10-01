
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodLogEntry } from '@/types/foodLog';
import { convertDbEntryToFoodLogEntry } from '@/utils/foodLogValidation';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import { useLocalTimezone } from './useLocalTimezone';
import { useFoodLogOperations } from './useFoodLogOperations';

export type { FoodLogEntry } from '@/types/foodLog';

export const useFoodLog = (selectedDate?: string) => {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [datesWithEntries, setDatesWithEntries] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentLocalDate } = useLocalTimezone();
  const { addEntry: addEntryOperation, updateEntry: updateEntryOperation, deleteEntry: deleteEntryOperation } = useFoodLogOperations();

  const fetchEntriesForDate = async (date?: string) => {
    try {
      setIsLoading(true);
      const queryDate = date || getCurrentLocalDate();
      
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('*')
        .eq('log_date', queryDate)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      
      const convertedEntries: FoodLogEntry[] = (data || []).map(convertDbEntryToFoodLogEntry);
      
      setEntries(convertedEntries);
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      logSecurityEvent('food_fetch_error', 'Failed to fetch food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDatesWithEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener fechas únicas de los últimos 60 días que tienen entradas
      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .select('log_date')
        .eq('user_id', user.id)
        .gte('log_date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw error;

      // Convertir fechas string a objetos Date y eliminar duplicados
      const uniqueDates = [...new Set((data || []).map(item => item.log_date))]
        .map(dateString => new Date(dateString + 'T00:00:00'));
      
      setDatesWithEntries(uniqueDates);
    } catch (err) {
      console.error('Error fetching dates with entries:', err);
    }
  };

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>): Promise<FoodLogEntry | null> => {
    try {
      const result = await addEntryOperation(entry, selectedDate);
      await fetchEntriesForDate(selectedDate);
      await fetchDatesWithEntries(); // Refrescar fechas con entradas
      return result;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      return null;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      const result = await updateEntryOperation(id, updates);
      await fetchEntriesForDate(selectedDate);
      return result;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      return false;
    }
  };

  const deleteEntry = async (id: number): Promise<boolean> => {
    try {
      const result = await deleteEntryOperation(id);
      await fetchEntriesForDate(selectedDate);
      await fetchDatesWithEntries(); // Refrescar fechas con entradas
      return result;
    } catch (err) {
      const secureError = createSecureErrorMessage(err, 'database');
      setError(secureError);
      return false;
    }
  };

  useEffect(() => {
    fetchEntriesForDate(selectedDate);
    fetchDatesWithEntries();
  }, [selectedDate]);

  return {
    entries,
    datesWithEntries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: () => {
      fetchEntriesForDate(selectedDate);
      fetchDatesWithEntries();
    }
  };
};
