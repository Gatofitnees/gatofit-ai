
import { useMemo } from 'react';
import { FoodLogEntry } from './useFoodLog';

export const useDateManagement = (selectedDate: Date, entries: FoodLogEntry[]) => {
  const selectedDateString = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  
  const isToday = useMemo(() => {
    return selectedDateString === new Date().toISOString().split('T')[0];
  }, [selectedDateString]);
  
  const isSelectedDay = !isToday;

  const formatSelectedDate = useMemo(() => {
    if (isToday) return "Hoy";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
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
    return entries.length > 0 ? [selectedDate] : [];
  };

  return {
    selectedDateString,
    isToday,
    isSelectedDay,
    formatSelectedDate,
    getDatesWithEntries
  };
};
