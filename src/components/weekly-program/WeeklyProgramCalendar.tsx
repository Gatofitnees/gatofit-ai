
import React from "react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";
import { cn } from "@/lib/utils";

interface WeeklyProgramCalendarProps {
  routines: WeeklyProgramRoutine[];
  onAddRoutine: (dayOfWeek: number) => void;
  onRemoveRoutine: (programRoutineId: string) => void;
  onMoveRoutine?: (programRoutineId: string, newDayOfWeek: number) => void;
  readOnly?: boolean;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' },
];

const WeeklyProgramCalendar: React.FC<WeeklyProgramCalendarProps> = ({
  routines,
  onAddRoutine,
  onRemoveRoutine,
  onMoveRoutine,
  readOnly = false
}) => {
  const getRoutinesForDay = (dayOfWeek: number) => {
    return routines
      .filter(r => r.day_of_week === dayOfWeek)
      .sort((a, b) => a.order_in_day - b.order_in_day);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const dayRoutines = getRoutinesForDay(day.id);
          const totalDuration = dayRoutines.reduce((sum, r) => 
            sum + (r.routine?.estimated_duration_minutes || 0), 0
          );

          return (
            <Card key={day.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{day.name}</h3>
                    {totalDuration > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(totalDuration)} total
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddRoutine(day.id)}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardBody className="pt-0">
                {dayRoutines.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">Sin rutinas asignadas</p>
                    {!readOnly && (
                      <p className="text-xs mt-1">Toca + para agregar una rutina</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayRoutines.map((programRoutine, index) => (
                      <div
                        key={programRoutine.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all",
                          "bg-secondary/50 hover:bg-secondary/70 border-border/50"
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {programRoutine.routine?.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {programRoutine.routine?.type && (
                              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                                {programRoutine.routine.type}
                              </span>
                            )}
                            {programRoutine.routine?.estimated_duration_minutes && (
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(programRoutine.routine.estimated_duration_minutes)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!readOnly && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground mr-2">
                              #{index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveRoutine(programRoutine.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgramCalendar;
