import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Target, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActiveProgramWithNavigation } from "@/hooks/useActiveProgramWithNavigation";

interface ProgramDayNavigatorProps {
  selectedDate: Date;
  onStartWorkout: (routineId: number) => void;
}

const ProgramDayNavigator: React.FC<ProgramDayNavigatorProps> = ({
  selectedDate,
  onStartWorkout
}) => {
  const {
    activeProgram,
    loading,
    isCompletedForSelectedDate,
    selectedProgramDate,
    currentDayInfo,
    currentDayIndex,
    availableDays,
    canGoToPrevious,
    canGoToNext,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    getDayLabel
  } = useActiveProgramWithNavigation(selectedDate);

  if (loading || !activeProgram) {
    return null;
  }

  const handleStartRoutine = () => {
    if (activeProgram.routines && activeProgram.routines.length > 0) {
      // If there's only one routine, start it directly
      if (activeProgram.routines.length === 1) {
        onStartWorkout(activeProgram.routines[0].routine_id);
      } else {
        // If multiple routines, start the first one (could be enhanced to show selection)
        onStartWorkout(activeProgram.routines[0].routine_id);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const getTotalDuration = () => {
    if (!activeProgram.routines) return 0;
    return activeProgram.routines.reduce((total, routine) => {
      return total + (routine.routine?.estimated_duration_minutes || 0);
    }, 0);
  };

  const getProgressText = () => {
    if (activeProgram.type === 'weekly') {
      return `Semana actual - ${getDayLabel(currentDayInfo!)}`;
    } else if (activeProgram.type === 'gatofit') {
      const totalDays = availableDays.length;
      return `Día ${currentDayIndex + 1} de ${totalDays}`;
    }
    return `Día ${currentDayIndex + 1}`;
  };

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 rounded-2xl p-4 border border-border/50 shadow-lg">
      {/* Program Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{activeProgram.program.name}</h3>
            <p className="text-xs text-muted-foreground">{getProgressText()}</p>
          </div>
        </div>
        {currentDayInfo && !currentDayInfo.isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Ir a hoy
          </Button>
        )}
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousDay}
          disabled={!canGoToPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <div className="text-sm font-medium">
            {currentDayInfo && getDayLabel(currentDayInfo)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(selectedProgramDate)}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          disabled={!canGoToNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Status and Routines */}
      <div className="space-y-3">
        {isCompletedForSelectedDate ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Entrenamientos completados</span>
          </div>
        ) : activeProgram.routines && activeProgram.routines.length > 0 ? (
          <>
            {/* Routines Info */}
            <div className="space-y-2">
              {activeProgram.routines.map((routine, index) => (
                <div
                  key={routine.id || index}
                  className="flex items-center justify-between p-2 bg-background/40 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {routine.routine?.name || `Rutina ${routine.routine_id}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {routine.routine?.estimated_duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{routine.routine.estimated_duration_minutes} min</span>
                          </div>
                        )}
                        {routine.routine?.type && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="capitalize">{routine.routine.type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Duration */}
            {getTotalDuration() > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Duración total estimada: {getTotalDuration()} minutos
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStartRoutine}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Rutina
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No hay rutinas programadas para este día
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDayNavigator;