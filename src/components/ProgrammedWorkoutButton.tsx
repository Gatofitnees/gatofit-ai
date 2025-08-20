
import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProgramUnified } from "@/hooks/useActiveProgramUnified";
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
  const { activeProgram, loading, isCompletedForSelectedDate, isCurrentDay } = useActiveProgramUnified(selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log para debug
  console.log('ProgrammedWorkoutButton state:', {
    loading,
    activeProgram,
    routinesLength: activeProgram?.routines?.length,
    selectedDate: selectedDate.toDateString(),
    isCurrentDay
  });

  // Don't show if loading
  if (loading) {
    return null;
  }

  // Don't show if no active program
  if (!activeProgram) {
    return null;
  }

  // Para programas Gatofit y Admin, mostrar el botón incluso si no hay rutinas para el día
  // para que el usuario sepa que tiene un programa activo
  if (activeProgram.type === 'gatofit' || activeProgram.type === 'admin') {
    // Si es un programa Gatofit o Admin activo, siempre mostrar el botón
    // Solo ocultar si no hay rutinas Y no es el día actual
    if (!activeProgram.routines || activeProgram.routines.length === 0) {
      if (!isCurrentDay) {
        return null; // No hay rutinas para un día que no es hoy
      }
    }
  } else {
    // Para programas semanales, solo mostrar si hay rutinas
    if (!activeProgram.routines || activeProgram.routines.length === 0) {
      return null;
    }
  }

  const handleButtonClick = () => {
    if (showModal) {
      // En HomePage, mostrar modal
      setIsModalOpen(true);
    } else {
      // En otros lugares, funcionalidad original
      if (activeProgram.routines && activeProgram.routines.length === 1 && isCurrentDay) {
        onStartWorkout(activeProgram.routines[0].routine_id);
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
    
    // Usar icono específico para admin programs
    if (activeProgram?.type === 'admin') {
      return <i className="fi fi-sr-apple-dumbbell text-lg" />;
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
        activeProgram={activeProgram.program}
        todayRoutines={activeProgram.routines}
        onStartRoutine={handleStartRoutine}
        isCurrentDay={isCurrentDay}
        isCompleted={isCompletedForSelectedDate}
        selectedDate={selectedDate}
        programType={activeProgram.type}
      />
    </>
  );
};

export default ProgrammedWorkoutButton;
