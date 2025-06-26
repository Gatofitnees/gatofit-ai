
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarDay {
  date: string;
  hasWorkout: boolean;
  hasNutrition: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDaySelect: (date: string) => void;
  monthData: Record<string, { has_workout: boolean; has_nutrition: boolean }>;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onDateChange,
  onDaySelect,
  monthData
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calcular días del calendario
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generar días del calendario
  const calendarDays: CalendarDay[] = [];

  // Días del mes anterior (para completar la primera semana)
  const prevMonth = new Date(year, month - 1, 0);
  const daysFromPrevMonth = firstDayWeekday;
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i + 1);
    const dateStr = date.toISOString().split('T')[0];
    calendarDays.push({
      date: dateStr,
      hasWorkout: monthData[dateStr]?.has_workout || false,
      hasNutrition: monthData[dateStr]?.has_nutrition || false,
      isToday: false,
      isCurrentMonth: false
    });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    
    calendarDays.push({
      date: dateStr,
      hasWorkout: monthData[dateStr]?.has_workout || false,
      hasNutrition: monthData[dateStr]?.has_nutrition || false,
      isToday,
      isCurrentMonth: true
    });
  }

  // Días del mes siguiente (para completar la última semana)
  const remainingDays = 42 - calendarDays.length; // 6 semanas × 7 días
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dateStr = date.toISOString().split('T')[0];
    calendarDays.push({
      date: dateStr,
      hasWorkout: monthData[dateStr]?.has_workout || false,
      hasNutrition: monthData[dateStr]?.has_nutrition || false,
      isToday: false,
      isCurrentMonth: false
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(year, month + (direction === 'next' ? 1 : -1), 1);
    onDateChange(newDate);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    onDaySelect(dateStr);
  };

  const getActivityIndicator = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return null;
    
    const hasActivity = day.hasWorkout || day.hasNutrition;
    if (!hasActivity) return null;

    if (day.hasWorkout && day.hasNutrition) {
      return (
        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full opacity-80 shadow-sm"></div>
      );
    } else if (day.hasWorkout) {
      return (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full opacity-70 shadow-sm"></div>
      );
    } else if (day.hasNutrition) {
      return (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-70 shadow-sm"></div>
      );
    }
    return null;
  };

  const getDayClassName = (day: CalendarDay) => {
    const baseClasses = "relative p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105";
    
    if (!day.isCurrentMonth) {
      return `${baseClasses} text-muted-foreground/40 opacity-50`;
    }
    
    if (day.isToday) {
      return `${baseClasses} bg-primary text-primary-foreground font-semibold shadow-neu-button`;
    }
    
    if (selectedDate === day.date) {
      return `${baseClasses} bg-secondary text-foreground font-medium shadow-neu-button-active border border-primary/20`;
    }
    
    if (day.hasWorkout || day.hasNutrition) {
      return `${baseClasses} bg-secondary/50 text-foreground hover:bg-secondary/70 font-medium`;
    }
    
    return `${baseClasses} text-foreground hover:bg-secondary/30`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-neu-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-secondary/50 transition-all duration-200 hover:shadow-neu-button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-base font-semibold text-foreground">
            {currentDate.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 rounded-lg hover:bg-secondary/50 transition-all duration-200 hover:shadow-neu-button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayNumber = new Date(day.date).getDate();
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={getDayClassName(day)}
            >
              <span className="relative z-10">{dayNumber}</span>
              {getActivityIndicator(day)}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full opacity-70 shadow-sm"></div>
          <span className="text-muted-foreground">Entrenamiento</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full opacity-70 shadow-sm"></div>
          <span className="text-muted-foreground">Nutrición</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-yellow-500 rounded-full opacity-80 shadow-sm"></div>
          <span className="text-muted-foreground">Completo</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
