
import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { useActiveWorkout } from "../hooks/useActiveWorkout";
import { Header } from "../components/active-workout/Header";
import { ExerciseList } from "../components/active-workout/ExerciseList";
import { SaveButton } from "../components/active-workout/SaveButton";
import { StatsDialog } from "../components/active-workout/StatsDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ActiveWorkoutPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const routineIdNum = routineId ? parseInt(routineId, 10) : undefined;
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const {
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleViewExerciseDetails,
    handleAddExercise,
    setShowStatsDialog,
    inViewRef,
    isInView
  } = useActiveWorkout(routineIdNum);

  if (loading) {
    return <LoadingSpinner />;
  }

  const isLastExerciseVisible = isInView;

  return (
    <div className="min-h-screen pb-32 bg-background">
      <Header
        routineName={routine?.name || "Entrenamiento"}
        onBack={handleBack}
      />
      
      <div className="p-4 pb-32">
        <ExerciseList 
          exercises={exercises}
          onInputChange={handleInputChange}
          onNotesChange={handleExerciseNotesChange}
          onAddSet={handleAddSet}
          onViewDetails={handleViewExerciseDetails}
        />

        <div className="mt-6 mb-4">
          <Button 
            variant="outline" 
            onClick={handleAddExercise}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Añadir otro ejercicio
          </Button>
        </div>
        
        {/* Invisible element to detect when we've scrolled to the bottom */}
        <div ref={inViewRef} className="h-4"></div>
        
        {/* Reference for scrolling to bottom */}
        <div ref={bottomRef}></div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0">
        <SaveButton 
          isSaving={isSaving} 
          onClick={handleSaveWorkout}
          isVisible={isLastExerciseVisible} 
        />
      </div>
      
      <StatsDialog 
        open={showStatsDialog !== null} 
        onClose={() => setShowStatsDialog(null)} 
      />
    </div>
  );
};

export default ActiveWorkoutPage;
