
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoutinePageHeader from "@/features/workout/components/RoutinePageHeader";
import RoutineFormContainer from "@/features/workout/components/RoutineFormContainer";
import RoutineDialogs from "@/features/workout/components/dialogs/RoutineDialogs";
import RoutineSheets from "@/features/workout/components/sheets/RoutineSheets";
import { useCreateRoutine } from "@/features/workout/hooks/useCreateRoutine";

const CreateRoutinePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showExitConfirmDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowExitConfirmDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    
    // Handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleExitRoutineCreation,
    confirmExit,
    cancelExit
  } = useCreateRoutine([]);

  // Load selected exercises from location state when available
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const exercises = location.state.selectedExercises.map((exercise: any) => ({
        ...exercise,
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      
      setRoutineExercises((prevExercises) => {
        // Get IDs of exercises we already have
        const existingIds = prevExercises.map(ex => ex.id);
        
        // Filter out exercises that are already in the list
        const newExercises = exercises.filter((ex: any) => !existingIds.includes(ex.id));
        
        // Return combined list
        return [...prevExercises, ...newExercises];
      });
    }
  }, [location.state, setRoutineExercises]);
  
  // Add event listener for navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (routineName || routineType || routineExercises.length > 0) {
        // Standard way of showing dialog
        e.preventDefault();
        // For modern browsers
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [routineName, routineType, routineExercises]);
  
  // Handle back button navigation
  const handleBackNavigation = () => {
    handleExitRoutineCreation("/workout");
  };
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <RoutinePageHeader 
        onSaveClick={handleSaveRoutineStart} 
        onBackClick={handleBackNavigation}
        isSubmitting={isSubmitting} 
      />
      
      <RoutineFormContainer
        routineName={routineName}
        routineType={routineType}
        routineExercises={routineExercises}
        validationErrors={validationErrors}
        onNameChange={setRoutineName}
        onTypeChange={setRoutineType}
        handleAddSet={handleAddSet}
        handleSetUpdate={handleSetUpdate}
        handleExerciseOptions={handleExerciseOptions}
        handleReorderClick={handleReorderClick}
        handleSelectExercises={handleSelectExercises}
      />

      {/* Dialog Components */}
      <RoutineDialogs
        showNoExercisesDialog={showNoExercisesDialog}
        setShowNoExercisesDialog={setShowNoExercisesDialog}
        showSaveConfirmDialog={showSaveConfirmDialog}
        setShowSaveConfirmDialog={setShowSaveConfirmDialog}
        showExitConfirmDialog={showExitConfirmDialog}
        setShowExitConfirmDialog={setShowExitConfirmDialog}
        handleSaveRoutine={handleSaveRoutine}
        confirmExit={confirmExit}
        cancelExit={cancelExit}
        isSubmitting={isSubmitting}
      />

      {/* Sheet Components */}
      <RoutineSheets
        showExerciseOptionsSheet={showExerciseOptionsSheet}
        setShowExerciseOptionsSheet={setShowExerciseOptionsSheet}
        showReorderSheet={showReorderSheet}
        setShowReorderSheet={setShowReorderSheet}
        currentExerciseIndex={currentExerciseIndex}
        handleRemoveExercise={handleRemoveExercise}
        handleMoveExercise={handleMoveExercise}
        routineExercises={routineExercises}
        navigateToSelectExercises={handleSelectExercises}
        handleReorderSave={handleReorderSave}
      />
    </div>
  );
};

export default CreateRoutinePage;
