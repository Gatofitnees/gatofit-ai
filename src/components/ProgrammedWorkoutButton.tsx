
import React, { useState } from "react";
import { Dumbbell, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { useActiveProgramForToday } from "@/hooks/useActiveProgramForToday";
import { cn } from "@/lib/utils";

interface ProgrammedWorkoutButtonProps {
  onStartWorkout: (routineId: number) => void;
}

const ProgrammedWorkoutButton: React.FC<ProgrammedWorkoutButtonProps> = ({
  onStartWorkout
}) => {
  const { activeProgram, todayRoutines, loading } = useActiveProgramForToday();
  const [showRoutines, setShowRoutines] = useState(false);

  // Don't show if no active program or no routines for today
  if (loading || !activeProgram || todayRoutines.length === 0) {
    return null;
  }

  const handleButtonClick = () => {
    if (todayRoutines.length === 1) {
      // If only one routine, start it directly
      onStartWorkout(todayRoutines[0].routine_id);
    } else {
      // If multiple routines, show the list
      setShowRoutines(!showRoutines);
    }
  };

  const handleRoutineSelect = (routineId: number) => {
    onStartWorkout(routineId);
    setShowRoutines(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={handleButtonClick}
        size="icon"
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button"
      >
        <Dumbbell className="h-5 w-5" />
      </Button>

      {/* Dropdown for multiple routines */}
      {showRoutines && todayRoutines.length > 1 && (
        <div className="absolute bottom-12 left-0 z-50 min-w-[200px]">
          <Card className="shadow-lg">
            <CardHeader
              title="Rutinas de Hoy"
              subtitle={`${todayRoutines.length} rutinas programadas`}
            />
            <CardBody className="pt-0 space-y-2">
              {todayRoutines.map((programRoutine, index) => (
                <button
                  key={programRoutine.id}
                  onClick={() => handleRoutineSelect(programRoutine.routine_id)}
                  className="w-full text-left p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="font-medium text-sm">
                    {programRoutine.routine?.name || 'Rutina'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    #{index + 1} • {programRoutine.routine?.estimated_duration_minutes || 30} min
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Background overlay for dropdown */}
      {showRoutines && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowRoutines(false)}
        />
      )}
    </div>
  );
};

export default ProgrammedWorkoutButton;
