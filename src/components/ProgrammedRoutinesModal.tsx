
import React from "react";
import { Calendar, Clock, Dumbbell, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WeeklyProgram, WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: WeeklyProgram | null;
  todayRoutines: WeeklyProgramRoutine[];
  onStartRoutine: (routineId: number) => void;
}

const ProgrammedRoutinesModal: React.FC<ProgrammedRoutinesModalProps> = ({
  isOpen,
  onClose,
  activeProgram,
  todayRoutines,
  onStartRoutine
}) => {
  if (!isOpen || !activeProgram || todayRoutines.length === 0) {
    return null;
  }

  const handleStartRoutine = (routineId: number) => {
    onStartRoutine(routineId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <Card className="shadow-xl">
          <CardHeader
            title="Rutinas Programadas"
            subtitle={`${todayRoutines.length} rutinas para hoy`}
            action={
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          
          <CardBody className="pt-0 space-y-3">
            {/* Program info */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{activeProgram.name}</p>
                <p className="text-xs text-blue-600">Programación activa</p>
              </div>
            </div>

            {/* Today's routines */}
            <div className="space-y-2">
              {todayRoutines.map((programRoutine, index) => (
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
                  
                  <Button
                    onClick={() => handleStartRoutine(programRoutine.routine_id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Iniciar Rutina
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProgrammedRoutinesModal;
