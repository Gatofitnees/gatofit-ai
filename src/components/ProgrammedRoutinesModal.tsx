
import React from "react";
import { Calendar, Clock, Dumbbell, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WeeklyProgram, WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: WeeklyProgram | null;
  dayRoutines: WeeklyProgramRoutine[];
  onStartRoutine: (routineId: number) => void;
  selectedDate: Date;
  isToday: boolean;
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ProgrammedRoutinesModal: React.FC<ProgrammedRoutinesModalProps> = ({
  isOpen,
  onClose,
  activeProgram,
  dayRoutines,
  onStartRoutine,
  selectedDate,
  isToday
}) => {
  if (!isOpen || !activeProgram || dayRoutines.length === 0) {
    return null;
  }

  const handleStartRoutine = (routineId: number) => {
    if (isToday) {
      onStartRoutine(routineId);
      onClose();
    }
  };

  const selectedDayName = dayNames[selectedDate.getDay()];
  const selectedDateFormatted = selectedDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-sm">
        <Card className="shadow-xl max-h-[80vh] overflow-hidden">
          <CardHeader
            title="Rutinas Programadas"
            subtitle={`${dayRoutines.length} rutinas para ${selectedDayName} ${selectedDateFormatted}`}
            action={
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          
          <CardBody className="pt-0 space-y-3 overflow-y-auto max-h-[60vh]">
            {/* Program info */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{activeProgram.name}</p>
                <p className="text-xs text-blue-600">Programación activa</p>
              </div>
            </div>

            {/* Day's routines */}
            <div className="space-y-2">
              {dayRoutines.map((programRoutine, index) => (
                <div
                  key={programRoutine.id}
                  className="p-3 border border-border/50 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {programRoutine.routine?.name || 'Rutina'}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {programRoutine.routine?.estimated_duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{programRoutine.routine.estimated_duration_minutes} min</span>
                      </div>
                    )}
                    {programRoutine.routine?.type && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className="capitalize">{programRoutine.routine.type}</span>
                      </div>
                    )}
                  </div>
                  
                  {isToday ? (
                    <Button
                      onClick={() => handleStartRoutine(programRoutine.routine_id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Iniciar Rutina
                    </Button>
                  ) : (
                    <div className="w-full p-2 bg-gray-100 rounded-lg text-center">
                      <span className="text-xs text-gray-500">
                        Solo se puede iniciar el día actual
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {!isToday && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 text-center">
                  Las rutinas solo pueden iniciarse el día actual
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProgrammedRoutinesModal;
