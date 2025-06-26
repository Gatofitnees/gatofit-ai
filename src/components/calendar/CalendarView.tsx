
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Star, Trophy } from 'lucide-react';
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

  const getActivityBadge = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return null;
    
    if (day.hasWorkout && day.hasNutrition) {
      return (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Trophy className="h-2.5 w-2.5 text-white" />
        </div>
      );
    } else if (day.hasWorkout) {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <Dumbbell className="h-2 w-2 text-white" />
        </div>
      );
    } else if (day.hasNutrition) {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <Utensils className="h-2 w-2 text-white" />
        </div>
      );
    }
    return null;
  };

  const getDayClassName = (day: CalendarDay) => {
    const baseClasses = "relative p-3 text-sm rounded-xl transition-all duration-300 hover:scale-105 transform";
    
    if (!day.isCurrentMonth) {
      return `${baseClasses} text-muted-foreground/50 opacity-40`;
    }
    
    if (day.isToday) {
      return `${baseClasses} bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow animate-gatofit-pulse font-bold`;
    }
    
    if (selectedDate === day.date) {
      return `${baseClasses} bg-gradient-to-br from-secondary to-secondary/80 text-foreground shadow-neu-button-active font-medium border-2 border-primary/30`;
    }
    
    if (day.hasWorkout || day.hasNutrition) {
      return `${baseClasses} bg-gradient-to-br from-secondary/60 to-secondary/40 text-foreground hover:bg-secondary/80 shadow-neu-card font-medium`;
    }
    
    return `${baseClasses} text-foreground hover:bg-secondary/30 shadow-neu-button hover:shadow-neu-card`;
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50 p-6 shadow-neu-card backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-10 w-10 p-0 rounded-xl hover:bg-secondary/20 transition-all duration-300 hover:scale-110 shadow-neu-button hover:shadow-neu-button-active group"
        >
          <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {currentDate.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-1"></div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-10 w-10 p-0 rounded-xl hover:bg-secondary/20 transition-all duration-300 hover:scale-110 shadow-neu-button hover:shadow-neu-button-active group"
        >
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Enhanced Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            {day}
          </div>
        ))}
      </div>

      {/* Enhanced Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayNumber = new Date(day.date).getDate();
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={getDayClassName(day)}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <span className="relative z-10">{dayNumber}</span>
              {getActivityBadge(day)}
            </button>
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:scale-105 transition-all duration-300 shadow-neu-card">
          <Dumbbell className="h-3 w-3 text-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Entrenamiento</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:scale-105 transition-all duration-300 shadow-neu-card">
          <Utensils className="h-3 w-3 text-blue-500" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Nutrición</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:scale-105 transition-all duration-300 shadow-neu-card">
          <Trophy className="h-3 w-3 text-yellow-500 animate-pulse" />
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Completo</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
