
import { useState, useEffect } from "react";
import { useRoutineDetail } from "./useRoutineDetail";
import { useExerciseData } from "./useExerciseData";
import { useSaveWorkout } from "./useSaveWorkout";
import { useWorkoutNavigation } from "./useWorkoutNavigation";
import { useInView } from "react-intersection-observer";

export function useActiveWorkout(routineId: number | undefined) {
  const [workoutStartTime] = useState<Date>(new Date());
  const { routine, exerciseDetails, loading } = useRoutineDetail(routineId);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });
  
  const {
    exercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode,
    appendExercises
  } = useExerciseData(exerciseDetails);

  const {
    isSaving,
    handleSaveWorkout
  } = useSaveWorkout(routine, workoutStartTime, exercises);

  const {
    handleBack,
    handleViewExerciseDetails,
    handleAddExercise
  } = useWorkoutNavigation(routineId, appendExercises);

  // This will ensure that when new exercises are added, they're properly added to the existing list
  useEffect(() => {
    if (exerciseDetails && exerciseDetails.length > 0) {
      // Only update if we're getting new exercises that should be added
      // This prevents overriding user input when navigating back
    }
  }, [exerciseDetails]);

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
    handleToggleReorderMode,
    inViewRef: ref,
    isInView: inView
  };
}
