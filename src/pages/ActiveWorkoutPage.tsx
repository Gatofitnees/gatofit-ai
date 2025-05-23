
import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { 
  WorkoutHeader,
  ExerciseList,
  ExerciseStatistics,
  LoadingSkeleton,
  RoutineNotFound,
  SaveButton
} from "@/features/workout/components/active-workout";
import { useActiveWorkout } from "@/features/workout/hooks/useActiveWorkout";
import DiscardChangesDialog from "@/features/workout/components/dialogs/DiscardChangesDialog";
import { Button } from "@/components/ui/button";
import { useActiveWorkoutExercises } from "@/features/workout/hooks/useActiveWorkoutExercises";
import { useWorkoutNavigation } from "@/features/workout/hooks/useWorkoutNavigation";

const ActiveWorkoutPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const location = useLocation();
  
  // Obtener datos básicos de la rutina y lógica base
  const {
    routine,
    exercises: baseExercises,
    loading,
    isSaving,
    showStatsDialog,
    showDiscardDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    confirmDiscardChanges,
    cancelDiscardChanges,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useActiveWorkout(routineId ? parseInt(routineId) : undefined);
  
  // Gestionar ejercicios temporales con el nuevo hook
  const {
    exercises,
    setExercises,
    addTemporaryExercises,
    clearTemporaryExercises
  } = useActiveWorkoutExercises(
    routineId ? parseInt(routineId) : undefined, 
    baseExercises
  );
  
  // Usar navigation hook con ejercicios actuales
  const { handleAddExercise } = useWorkoutNavigation(
    routineId ? parseInt(routineId) : undefined,
    exercises
  );
  
  // Detectar si volvemos de seleccionar ejercicios
  useEffect(() => {
    if (location.state && location.state.selectedExercises && location.state.isActiveWorkout) {
      // Añadir ejercicios temporales
      addTemporaryExercises(location.state.selectedExercises);
      
      // Limpiar el estado de navegación
      window.history.replaceState(
        {
          ...window.history.state,
          usr: {
            ...window.history.state.usr,
            selectedExercises: null,
            isActiveWorkout: null
          }
        },
        ''
      );
    }
  }, [location.state, addTemporaryExercises]);

  if (loading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }
  
  if (!routine) {
    return <RoutineNotFound onBack={handleBack} />;
  }

  // Find the exercise that matches the current statistics dialog
  const currentStatsExercise = exercises.find(ex => ex.id === showStatsDialog);

  // Función para guardar entrenamiento que incluye ejercicios temporales
  const saveWorkoutWithTemporaryExercises = async () => {
    // Usar los ejercicios actuales (incluyendo los temporales) al guardar
    await handleSaveWorkout(exercises);
    // Limpiar los ejercicios temporales después de guardar
    clearTemporaryExercises();
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <WorkoutHeader 
        routineName={routine.name}
        isReorderMode={isReorderMode}
        isSaving={isSaving}
        onBack={handleBack}
        onToggleReorder={handleToggleReorderMode}
        onSave={saveWorkoutWithTemporaryExercises}
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
      
      {/* Save button (only at the bottom of the exercise list) */}
      {exercises.length > 0 && (
        <div className="mt-6 mb-20">
          <Button 
            variant="default"
            className="w-full"
            onClick={saveWorkoutWithTemporaryExercises}
            disabled={isSaving}
          >
            {isSaving ? "Guardando entrenamiento..." : "Guardar entrenamiento"}
          </Button>
        </div>
      )}
      
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

      {/* Discard Changes Dialog */}
      <DiscardChangesDialog
        open={showDiscardDialog}
        onOpenChange={cancelDiscardChanges}
        onConfirm={confirmDiscardChanges}
      />
    </div>
  );
};

export default ActiveWorkoutPage;
