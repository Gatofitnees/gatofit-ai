
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useHomePageData } from "@/hooks/useHomePageData";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";
import FloatingActionButton from "../components/FloatingActionButton";
import { useAuth } from "@/contexts/AuthContext";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    selectedDate,
    hasCompletedWorkout,
    workoutSummary,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect
  } = useHomePageData();

  const handleStartWorkout = () => {
    navigate("/workout");
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

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* User header and profile */}
      <UserHeader />
      
      {/* Day selector */}
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithWorkouts}
      />

      {/* Training card */}
      <TrainingCard
        loading={loading}
        completed={hasCompletedWorkout}
        workout={workoutSummary}
        onStartWorkout={handleStartWorkout}
        onViewDetails={() => handleViewWorkoutDetails(workoutSummary?.id)}
      />
      
      {/* Macros card */}
      <MacrosCard 
        macros={macros}
        onAddFood={handleAddFood}
      />
      
      {/* Floating action button */}
      <FloatingActionButton onClick={handleAddFood} />
    </div>
  );
};

export default HomePage;
