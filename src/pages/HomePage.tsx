
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useHomePageData } from "@/hooks/useHomePageData";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";
import NutritionCard from "../components/NutritionCard";
import FloatingActionButton from "../components/FloatingActionButton";

const HomePage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    selectedDate,
    hasCompletedWorkout,
    workoutSummaries,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect
  } = useHomePageData();

  const handleStartWorkout = (routineId?: number) => {
    if (routineId) {
      // Si se proporciona un routineId, iniciar esa rutina específica
      navigate(`/workout/active/${routineId}`);
    } else {
      // Si no, ir a la página de selección de rutinas
      navigate("/workout");
    }
  };

  const handleViewWorkoutDetails = (workoutId?: number) => {
    if (workoutId) {
      navigate(`/workout/summary/${workoutId}`);
    } else {
      toast({
        title: "Detalles del entrenamiento",
        description: "No se pudo encontrar el entrenamiento.",
      });
    }
  };

  const handleAddFood = () => {
    toast({
      title: "Añadir comida",
      description: "Redirigiendo a la página de nutrición...",
    });
    navigate("/nutrition");
  };

  const handleStartNutrition = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    navigate(`/nutrition-program?date=${dateString}`);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <UserHeader />
      
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithWorkouts}
      />

      <TrainingCard
        loading={loading}
        completed={hasCompletedWorkout}
        workouts={workoutSummaries}
        onStartWorkout={handleStartWorkout}
        onViewDetails={handleViewWorkoutDetails}
        showProgramModal={true}
        selectedDate={selectedDate}
      />

      
      <MacrosCard 
        macros={macros}
        onAddFood={handleAddFood}
      />
      
      <FloatingActionButton onClick={handleAddFood} />
    </div>
  );
};

export default HomePage;
