
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const getActivityIndicator = (day: CalendarDay) => {
    if (day.hasWorkout && day.hasNutrition) {
      return 'bg-yellow-500'; // Día completo
    } else if (day.hasWorkout) {
      return 'bg-green-500'; // Solo entrenamiento
    } else if (day.hasNutrition) {
      return 'bg-blue-500'; // Solo nutrición
    }
    return 'bg-transparent';
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayNumber = new Date(day.date).getDate();
          
          return (
            <button
              key={index}
              onClick={() => onDaySelect(day.date)}
              className={`
                relative p-2 text-sm rounded-md transition-colors
                ${day.isCurrentMonth 
                  ? 'text-foreground hover:bg-muted' 
                  : 'text-muted-foreground opacity-50'
                }
                ${day.isToday ? 'bg-primary text-primary-foreground' : ''}
              `}
            >
              <span className="relative z-10">{dayNumber}</span>
              
              {/* Indicador de actividad */}
              {(day.hasWorkout || day.hasNutrition) && (
                <div className={`
                  absolute bottom-1 left-1/2 transform -translate-x-1/2
                  w-2 h-2 rounded-full ${getActivityIndicator(day)}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Entrenamiento</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Nutrición</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Completo</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
