
import { useMemo } from 'react';
import { FoodLogEntry } from './useFoodLog';
import { useLocalTimezone } from './useLocalTimezone';

export const useDateManagement = (selectedDate: Date, entries: FoodLogEntry[], datesWithEntries: Date[] = []) => {
  const { getCurrentLocalDate, getLocalDateString, isDateToday } = useLocalTimezone();
  
  const selectedDateString = useMemo(() => getLocalDateString(selectedDate), [selectedDate, getLocalDateString]);
  
  const isToday = useMemo(() => {
    return isDateToday(selectedDateString);
  }, [selectedDateString, isDateToday]);
  
  const isSelectedDay = !isToday;

  const formatSelectedDate = useMemo(() => {
    if (isToday) return "Hoy";
    
    // Usar fecha local para los cálculos de diferencia
    const today = new Date();
    const selected = new Date(selectedDate);
    
    // Normalizar a medianoche en zona local
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - selected.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Ayer";
    if (diffDays > 1 && diffDays < 7) return `Hace ${diffDays} días`;
    
    return selected.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  }, [isToday, selectedDate]);

  const getDatesWithEntries = (): Date[] => {
    return datesWithEntries;
  };

  return {
    selectedDateString,
    isToday,
    isSelectedDay,
    formatSelectedDate,
    getDatesWithEntries
  };
};
