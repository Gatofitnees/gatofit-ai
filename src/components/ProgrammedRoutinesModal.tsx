
import React from "react";
import { Calendar, Clock, Dumbbell, Target, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WeeklyProgram, WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";
import { GatofitProgram } from "@/hooks/useGatofitPrograms";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: WeeklyProgram | GatofitProgram | null;
  todayRoutines: any[];
  onStartRoutine: (routineId: number) => void;
  isCurrentDay: boolean;
  isCompleted: boolean;
  selectedDate: Date;
  programType?: 'weekly' | 'gatofit';
}

const ProgrammedRoutinesModal: React.FC<ProgrammedRoutinesModalProps> = ({
  isOpen,
  onClose,
  activeProgram,
  todayRoutines,
  onStartRoutine,
  isCurrentDay,
  isCompleted,
  selectedDate,
  programType = 'weekly'
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isOpen || !activeProgram) {
    return null;
  }

  // Para programas Gatofit sin rutinas, mostrar mensaje informativo
  if (todayRoutines.length === 0 && programType === 'gatofit') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader
              title="Programa Gatofit"
              subtitle={formatDate(selectedDate)}
              action={
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              }
            />
            
            <CardBody className="pt-0 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{activeProgram.name}</p>
                  <p className="text-xs">No hay rutinas programadas para este día</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (todayRoutines.length === 0) {
    return null;
  }

  const handleStartRoutine = (routineId: number) => {
    if (isCurrentDay) {
      onStartRoutine(routineId);
      onClose();
    }
  };


  const getDayMessage = () => {
    if (isCompleted) {
      return "Entrenamientos completados para este día";
    }
    if (!isCurrentDay) {
      return "Puedes ver las rutinas programadas pero solo iniciar las del día actual";
    }
    const programTypeName = programType === 'gatofit' ? 'Programa Gatofit' : 'Rutinas programadas';
    return `${programTypeName} para hoy`;
  };

  const getMessageIcon = () => {
    if (isCompleted) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (!isCurrentDay) {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getMessageColor = () => {
    if (isCompleted) {
      return "bg-green-50 text-green-900";
    }
    if (!isCurrentDay) {
      return "bg-orange-50 text-orange-900";
    }
    return "bg-blue-50 text-blue-900";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-xl max-h-[85vh] overflow-y-auto">
          <CardHeader
            title="Rutinas Programadas"
            subtitle={formatDate(selectedDate)}
            action={
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          
          <CardBody className="pt-0 space-y-4">
            {/* Program info */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${getMessageColor()}`}>
              {getMessageIcon()}
              <div>
                <p className="text-sm font-medium">{activeProgram.name}</p>
                <p className="text-xs">{getDayMessage()}</p>
              </div>
            </div>

            {/* Today's routines */}
            <div className="space-y-3">
              {todayRoutines.map((programRoutine, index) => (
                <div
                  key={programRoutine.id}
                  className="p-4 border border-border/50 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-base">
                      {programRoutine.routine?.name || 'Rutina'}
                    </h4>
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
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
                    disabled={!isCurrentDay || isCompleted}
                  >
                    <Dumbbell className="h-4 w-4 mr-2" />
                    {isCompleted ? "Completado" : !isCurrentDay ? "Solo disponible hoy" : "Iniciar Rutina"}
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
