
import React from "react";
import RoutinePageHeader from "@/features/workout/components/RoutinePageHeader";
import RoutineFormContainer from "@/features/workout/components/RoutineFormContainer";
import RoutineDialogs from "@/features/workout/components/dialogs/RoutineDialogs";
import RoutineSheets from "@/features/workout/components/sheets/RoutineSheets";
import { useCreateRoutine } from "@/features/workout/hooks/useCreateRoutine";
import { RoutineProvider } from "@/features/workout/contexts/RoutineContext";
import { useToast } from "@/hooks/use-toast";

const CreateRoutinePageContent: React.FC = () => {
  const { toast } = useToast();
  
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
    handleBackClick
  } = useCreateRoutine([]);
  
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (routineName || routineType || routineExercises.length > 0) {
        const message = "¿Está seguro que desea salir? Los cambios no guardados se perderán.";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [routineName, routineType, routineExercises]);
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <RoutinePageHeader 
        onSaveClick={handleSaveRoutineStart}
        onBackClick={handleBackClick}
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

const CreateRoutinePage: React.FC = () => {
  return (
    <RoutineProvider>
      <CreateRoutinePageContent />
    </RoutineProvider>
  );
};

export default CreateRoutinePage;
