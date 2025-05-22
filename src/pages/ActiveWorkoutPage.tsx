
import React from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  WorkoutHeader,
  ExerciseList,
  ExerciseStatistics
} from "@/features/workout/components/active-workout";
import { useActiveWorkout } from "@/features/workout/hooks/useActiveWorkout";

const ActiveWorkoutPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  
  const {
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    handleAddExercise,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useActiveWorkout(routineId ? parseInt(routineId) : undefined);

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (!routine) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Rutina no encontrada</h1>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            La rutina que estás buscando no existe o ha sido eliminada.
          </p>
          <Button onClick={() => handleBack()}>
            Volver a Mis Rutinas
          </Button>
        </div>
      </div>
    );
  }

  // Find the exercise that matches the current statistics dialog
  const currentStatsExercise = exercises.find(ex => ex.id === showStatsDialog);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <WorkoutHeader 
        routineName={routine.name}
        isReorderMode={isReorderMode}
        isSaving={isSaving}
        onBack={handleBack}
        onToggleReorder={handleToggleReorderMode}
        onSave={handleSaveWorkout}
      />
      
      {/* Workout Info */}
      <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <span>Tipo: {routine.description || "General"}</span>
          <span>Tiempo estimado: {routine.estimated_duration_minutes || 30} min</span>
        </div>
      </div>
      
      {/* Exercise List */}
      <ExerciseList 
        exercises={exercises}
        isReorderMode={isReorderMode}
        routineId={routineId}
        onReorderDrag={handleReorderDrag}
        onInputChange={handleInputChange}
        onAddSet={handleAddSet}
        onNotesChange={handleExerciseNotesChange}
        onViewDetails={handleViewExerciseDetails}
        onShowStats={(exerciseId) => setShowStatsDialog(exerciseId)}
        onAddExercise={handleAddExercise}
      />
      
      {/* Save button (bottom) */}
      <div className="fixed left-0 right-0 bottom-16 px-4 py-3 bg-background/80 backdrop-blur-md z-10 border-t border-white/5">
        <Button 
          variant="default"
          className="w-full"
          onClick={handleSaveWorkout}
          disabled={isSaving}
        >
          {isSaving ? "Guardando entrenamiento..." : "Guardar entrenamiento"}
        </Button>
      </div>
      
      {/* Statistics Dialog */}
      {currentStatsExercise && (
        <ExerciseStatistics 
          exerciseName={currentStatsExercise.name}
          showStatsDialog={showStatsDialog !== null}
          onCloseDialog={() => setShowStatsDialog(null)}
          previousData={showStatsDialog ? currentStatsExercise.sets.map(set => ({
            weight: set.previous_weight,
            reps: set.previous_reps
          })) : []}
        />
      )}
    </div>
  );
};

export default ActiveWorkoutPage;
