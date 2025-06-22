
import { useMemo } from 'react';

export const useLocalTimezone = () => {
  const userTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const getCurrentLocalDate = () => {
    const now = new Date();
    // Obtener la fecha local del usuario como string YYYY-MM-DD
    return now.toLocaleDateString('en-CA'); // formato ISO (YYYY-MM-DD) en zona local
  };

  const getLocalDateString = (date: Date) => {
    // Convertir cualquier fecha a string local del usuario
    return date.toLocaleDateString('en-CA');
  };

  const isDateToday = (dateString: string) => {
    return dateString === getCurrentLocalDate();
  };

  const isDateSameAsSelected = (dateString: string, selectedDate: Date) => {
    return dateString === getLocalDateString(selectedDate);
  };

  return {
    userTimezone,
    getCurrentLocalDate,
    getLocalDateString,
    isDateToday,
    isDateSameAsSelected
  };
};
