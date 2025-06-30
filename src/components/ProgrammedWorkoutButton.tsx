
import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProgramForSelectedDate } from "@/hooks/useActiveProgramForSelectedDate";
import ProgrammedRoutinesModal from "./ProgrammedRoutinesModal";

interface ProgrammedWorkoutButtonProps {
  onStartWorkout: (routineId: number) => void;
  showModal?: boolean;
  selectedDate?: Date;
}

const ProgrammedWorkoutButton: React.FC<ProgrammedWorkoutButtonProps> = ({
  onStartWorkout,
  showModal = false,
  selectedDate = new Date()
}) => {
  const { activeProgram, dayRoutines, loading, hasCompletedWorkout } = useActiveProgramForSelectedDate(selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if no active program or no routines for selected day
  if (loading || !activeProgram || dayRoutines.length === 0) {
    return null;
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const buttonIcon = hasCompletedWorkout ? <Check className="h-5 w-5" /> : <Calendar className="h-5 w-5" />;
  const buttonClass = hasCompletedWorkout 
    ? "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button border-2 border-green-500"
    : "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button";

  const handleButtonClick = () => {
    if (showModal) {
      // En HomePage, mostrar modal
      setIsModalOpen(true);
    } else {
      // En otros lugares, funcionalidad original
      if (dayRoutines.length === 1 && isToday) {
        onStartWorkout(dayRoutines[0].routine_id);
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
        className={buttonClass}
      >
        {buttonIcon}
      </Button>

      {/* Modal for programmed routines */}
      <ProgrammedRoutinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProgram={activeProgram}
        dayRoutines={dayRoutines}
        onStartRoutine={handleStartRoutine}
        selectedDate={selectedDate}
        isToday={isToday}
      />
    </>
  );
};

export default ProgrammedWorkoutButton;
