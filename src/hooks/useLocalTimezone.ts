
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

  // Nueva función para crear una fecha en zona local como timestamp UTC para la base de datos
  const createLocalDateAsUTC = (localDate?: Date) => {
    const date = localDate || new Date();
    // Crear un timestamp que represente la fecha/hora local como si fuera UTC
    // Esto evita que la base de datos aplique conversiones adicionales
    const localISOString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return localISOString;
  };

  // Nueva función para obtener el rango de fechas de un día en la zona local del usuario
  const getLocalDayRange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const startOfDay = `${year}-${month}-${day}T00:00:00`;
    const endOfDay = `${year}-${month}-${day}T23:59:59`;
    
    return { startOfDay, endOfDay };
  };

  return {
    userTimezone,
    getCurrentLocalDate,
    getLocalDateString,
    isDateToday,
    isDateSameAsSelected,
    createLocalDateAsUTC,
    getLocalDayRange
  };
};
