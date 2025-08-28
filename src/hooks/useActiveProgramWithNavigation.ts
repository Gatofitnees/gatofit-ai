import { useState, useCallback, useMemo } from "react";
import { useActiveProgramUnified, UnifiedProgramData } from "./useActiveProgramUnified";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProgramDay {
  date: Date;
  dayNumber: number;
  weekNumber?: number;
  routines: any[];
  isCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export const useActiveProgramWithNavigation = (initialSelectedDate: Date) => {
  const [selectedProgramDate, setSelectedProgramDate] = useState(initialSelectedDate);
  const { toast } = useToast();
  
  // Get active program data for the selected program date
  const { activeProgram, loading, isCompletedForSelectedDate, refetch } = useActiveProgramUnified(selectedProgramDate);
  
  // Calculate available program days
  const availableDays = useMemo(() => {
    if (!activeProgram) return [];

    const today = new Date();
    const days: ProgramDay[] = [];

    if (activeProgram.type === 'weekly') {
      // For weekly programs, show current week (Monday to Sunday)
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(today.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        
        days.push({
          date: dayDate,
          dayNumber: i + 1, // 1 = Monday, 7 = Sunday
          routines: [], // Will be loaded when selected
          isCompleted: false, // Will be calculated when selected
          isToday: dayDate.toDateString() === today.toDateString(),
          isPast: dayDate < today && dayDate.toDateString() !== today.toDateString(),
          isFuture: dayDate > today
        });
      }
    } else if (activeProgram.type === 'gatofit' && activeProgram.userProgress) {
      // For Gatofit programs, calculate available days based on program progress
      const startDate = new Date(activeProgram.userProgress.started_at);
      const gatofitProgram = activeProgram.program as any; // Type assertion for Gatofit program
      const totalWeeks = gatofitProgram.duration_weeks || 12;
      const totalDays = totalWeeks * 7;

      for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + dayIndex);
        
        const weekNumber = Math.floor(dayIndex / 7) + 1;
        const dayOfWeek = dayIndex % 7;

        days.push({
          date: dayDate,
          dayNumber: dayIndex + 1,
          weekNumber,
          routines: [], // Will be loaded when selected
          isCompleted: false, // Will be calculated when selected
          isToday: dayDate.toDateString() === today.toDateString(),
          isPast: dayDate < today && dayDate.toDateString() !== today.toDateString(),
          isFuture: dayDate > today
        });
      }
    }

    return days;
  }, [activeProgram]);

  // Get current day info
  const currentDayInfo = useMemo(() => {
    return availableDays.find(day => 
      day.date.toDateString() === selectedProgramDate.toDateString()
    );
  }, [availableDays, selectedProgramDate]);

  // Get current day index
  const currentDayIndex = useMemo(() => {
    return availableDays.findIndex(day => 
      day.date.toDateString() === selectedProgramDate.toDateString()
    );
  }, [availableDays, selectedProgramDate]);

  // Navigation functions
  const goToPreviousDay = useCallback(() => {
    if (currentDayIndex > 0) {
      const previousDay = availableDays[currentDayIndex - 1];
      setSelectedProgramDate(previousDay.date);
    }
  }, [currentDayIndex, availableDays]);

  const goToNextDay = useCallback(() => {
    if (currentDayIndex < availableDays.length - 1) {
      const nextDay = availableDays[currentDayIndex + 1];
      setSelectedProgramDate(nextDay.date);
    }
  }, [currentDayIndex, availableDays]);

  const goToDay = useCallback((dayIndex: number) => {
    if (dayIndex >= 0 && dayIndex < availableDays.length) {
      const targetDay = availableDays[dayIndex];
      setSelectedProgramDate(targetDay.date);
    }
  }, [availableDays]);

  const goToToday = useCallback(() => {
    const today = new Date();
    const todayDay = availableDays.find(day => day.isToday);
    if (todayDay) {
      setSelectedProgramDate(todayDay.date);
    } else {
      setSelectedProgramDate(today);
    }
  }, [availableDays]);

  // Format day label
  const getDayLabel = useCallback((day: ProgramDay) => {
    if (activeProgram?.type === 'weekly') {
      const dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
      const dayOfWeek = day.date.getDay();
      const mondayFirstDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return dayNames[mondayFirstDay];
    } else if (activeProgram?.type === 'gatofit') {
      return `Día ${day.dayNumber}`;
    }
    return `Día ${day.dayNumber}`;
  }, [activeProgram]);

  // Check if navigation is possible
  const canGoToPrevious = currentDayIndex > 0;
  const canGoToNext = currentDayIndex < availableDays.length - 1;

  return {
    // Program data
    activeProgram,
    loading,
    isCompletedForSelectedDate,
    selectedProgramDate,
    
    // Day navigation
    availableDays,
    currentDayInfo,
    currentDayIndex,
    canGoToPrevious,
    canGoToNext,
    
    // Navigation functions
    goToPreviousDay,
    goToNextDay,
    goToDay,
    goToToday,
    getDayLabel,
    
    // Utils
    refetch
  };
};