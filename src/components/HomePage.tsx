
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Button from "../components/Button";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useHomePageData } from "@/hooks/useHomePageData";

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
        description: "Mostrando detalles del entrenamiento...",
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
      
      {/* Day selector with timezone support */}
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithWorkouts}
        selectedDate={selectedDate}
      />

      {/* Training card */}
      <TrainingCard
        loading={loading}
        completed={hasCompletedWorkout}
        workout={workoutSummary}
        onStartWorkout={handleStartWorkout}
        onViewDetails={() => handleViewWorkoutDetails(workoutSummary?.id)}
      />
      
      {/* Macros card with timezone-aware food data */}
      <MacrosCard 
        macros={macros}
        onAddFood={handleAddFood} 
      />
      
      {/* Botón flotante para añadir comida */}
      <div className="fixed right-4 bottom-20 z-30">
        <Button
          variant="primary"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={handleAddFood}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
