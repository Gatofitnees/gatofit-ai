
import { useState } from "react";
import { useRoutineDetail } from "./useRoutineDetail";
import { useExerciseData } from "./useExerciseData";
import { useSaveWorkout } from "./useSaveWorkout";
import { useWorkoutNavigation } from "./useWorkoutNavigation";

export function useActiveWorkout(routineId: number | undefined) {
  const [workoutStartTime] = useState<Date>(new Date());
  const { routine, exerciseDetails, loading } = useRoutineDetail(routineId);
  
  const {
    exercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useExerciseData(exerciseDetails);

  const {
    isSaving,
    handleSaveWorkout
  } = useSaveWorkout(routine, workoutStartTime, exercises);

  const {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise
  } = useWorkoutNavigation(routineId);

  return {
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
  };
}
