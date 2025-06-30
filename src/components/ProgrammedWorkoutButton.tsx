
import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProgramForToday } from "@/hooks/useActiveProgramForToday";
import ProgrammedRoutinesModal from "./ProgrammedRoutinesModal";

interface ProgrammedWorkoutButtonProps {
  onStartWorkout: (routineId: number) => void;
  showModal?: boolean;
}

const ProgrammedWorkoutButton: React.FC<ProgrammedWorkoutButtonProps> = ({
  onStartWorkout,
  showModal = false
}) => {
  const { activeProgram, todayRoutines, loading } = useActiveProgramForToday();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if no active program or no routines for today
  if (loading || !activeProgram || todayRoutines.length === 0) {
    return null;
  }

  const handleButtonClick = () => {
    if (showModal) {
      // En HomePage, mostrar modal
      setIsModalOpen(true);
    } else {
      // En otros lugares, funcionalidad original
      if (todayRoutines.length === 1) {
        onStartWorkout(todayRoutines[0].routine_id);
      } else {
        setIsModalOpen(true);
      }
    }
  };

  const handleStartRoutine = (routineId: number) => {
    onStartWorkout(routineId);
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        size="icon"
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button"
      >
        <Calendar className="h-5 w-5" />
      </Button>

      {/* Modal for programmed routines */}
      <ProgrammedRoutinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProgram={activeProgram}
        todayRoutines={todayRoutines}
        onStartRoutine={handleStartRoutine}
      />
    </>
  );
};

export default ProgrammedWorkoutButton;
