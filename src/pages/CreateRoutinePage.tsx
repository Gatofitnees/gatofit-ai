
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useBlocker } from "react-router-dom";
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
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
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
    handleDiscardChanges,
    handleNavigateAway
  } = useCreateRoutine([]);

  // State to handle navigation blocking
  const [blockedNavigation, setBlockedNavigation] = useState<string | null>(null);

  // Custom navigation blocker - corrected to match the expected type signature
  const shouldBlock = useCallback(
    ({ nextLocation }) => {
      // Don't block navigation to select-exercises
      if (nextLocation.pathname === "/workout/select-exercises") {
        return false;
      }

      // Check if we should show the dialog
      const hasChanges = routineName !== "" || routineType !== "" || routineExercises.length > 0;
      if (hasChanges) {
        setBlockedNavigation(nextLocation.pathname);
        setShowDiscardChangesDialog(true);
        return true;
      }
      return false;
    },
    [routineName, routineType, routineExercises, setShowDiscardChangesDialog]
  );

  // Set up the navigation blocker
  useBlocker(shouldBlock);

  // Handle confirm discard changes
  const handleConfirmDiscardChanges = useCallback(() => {
    if (blockedNavigation) {
      navigate(blockedNavigation);
    }
  }, [blockedNavigation, navigate]);
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <RoutinePageHeader 
        onSaveClick={handleSaveRoutineStart} 
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
        showDiscardChangesDialog={showDiscardChangesDialog}
        setShowDiscardChangesDialog={setShowDiscardChangesDialog}
        handleSaveRoutine={handleSaveRoutine}
        handleDiscardChanges={handleDiscardChanges}
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
