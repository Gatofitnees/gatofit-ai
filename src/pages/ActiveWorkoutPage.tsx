
import React from "react";
import { useParams } from "react-router-dom";
import { 
  WorkoutHeader,
  ExerciseList,
  ExerciseStatistics,
  LoadingSkeleton,
  RoutineNotFound,
  SaveButton
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
    return <LoadingSkeleton onBack={handleBack} />;
  }
  
  if (!routine) {
    return <RoutineNotFound onBack={handleBack} />;
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
      <SaveButton 
        isSaving={isSaving}
        onClick={handleSaveWorkout}
      />
      
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
