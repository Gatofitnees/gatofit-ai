
import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProgramForSelectedDate } from "@/hooks/useActiveProgramForSelectedDate";
import ProgrammedRoutinesModal from "./ProgrammedRoutinesModal";
import { cn } from "@/lib/utils";

interface ProgrammedWorkoutButtonProps {
  onStartWorkout: (routineId: number) => void;
  showModal?: boolean;
  selectedDate: Date;
}

const ProgrammedWorkoutButton: React.FC<ProgrammedWorkoutButtonProps> = ({
  onStartWorkout,
  showModal = false,
  selectedDate
}) => {
  const { activeProgram, todayRoutines, loading, isCompletedForSelectedDate, isCurrentDay } = useActiveProgramForSelectedDate(selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if no active program or no routines for selected day
  if (loading || !activeProgram || todayRoutines.length === 0) {
    return null;
  }

  const handleButtonClick = () => {
    if (showModal) {
      // En HomePage, mostrar modal
      setIsModalOpen(true);
    } else {
      // En otros lugares, funcionalidad original
      if (todayRoutines.length === 1 && isCurrentDay) {
        onStartWorkout(todayRoutines[0].routine_id);
      } else {
        setIsModalOpen(true);
      }
    }
  };

  const handleStartRoutine = (routineId: number) => {
    onStartWorkout(routineId);
  };

  const getButtonIcon = () => {
    if (isCompletedForSelectedDate) {
      return <Check className="h-5 w-5" />;
    }
    return <Calendar className="h-5 w-5" />;
  };

  const getButtonStyle = () => {
    if (isCompletedForSelectedDate) {
      return "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button border-2 border-green-500";
    }
    return "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-neu-button";
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        size="icon"
        className={cn(getButtonStyle())}
      >
        {getButtonIcon()}
      </Button>

      {/* Modal for programmed routines */}
      <ProgrammedRoutinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProgram={activeProgram}
        todayRoutines={todayRoutines}
        onStartRoutine={handleStartRoutine}
        isCurrentDay={isCurrentDay}
        isCompleted={isCompletedForSelectedDate}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default ProgrammedWorkoutButton;
